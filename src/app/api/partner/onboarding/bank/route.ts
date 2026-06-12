import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import PartnerBank from "@/model/partnerBank.model";
import User from "@/model/user.model";

const IFSC_RAGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export async function POST(req: Request) {
	try {
		await dbConnect();

		const session = await auth();
		if (!session || !session.user?.email) {
			return Response.json({ message: "unauthorized" }, { status: 401 });
		}

		const user = await User.findOne({ email: session.user.email });
		if (!user) {
			return Response.json({ message: "user not found" }, { status: 401 });
		}

		if (user.partnerOnBoardingStep < 2) {
			return Response.json({
				message: "please complete previous steps",
				status: 400,
			});
		}

		const { accountHolder, accountNumber, ifscCode, mobile, upi } =
			await req.json();

		if (!accountHolder || !accountNumber || !ifscCode || !mobile) {
			return Response.json({
				message: "missing required documents",
				status: 400,
			});
		}

		if (ifscCode.length !== 11 || !IFSC_RAGEX.test(ifscCode)) {
			return Response.json({
				message: "invalid ifsc code",
				status: 400,
			});
		}

		const partnerBank = await PartnerBank.findOneAndUpdate(
			{ owner: user._id },
			{
				$set: {
					accountHolder,
					accountNumber,
					ifscCode,
					mobile,
					upi,
					status: "added",
				},
			},
			{ upsert: true, new: true }, // update if present, else create
		);

		user.mobile = mobile;
		user.partnerStatus = "pending";
		user.partnerOnBoardingStep = 3;
		user.videoKycRoomId = ""
		user.videoKycStatus = "not required"
		await user.save();

		return Response.json(partnerBank, { status: 200 });
	} catch (error) {
		console.log("partner bank details error, err: ", error);
		return Response.json(
			{ message: "partner bank details error, err: ", error },
			{ status: 500 },
		);
	}
}

export async function GET() {
	try {
		await dbConnect();

		const session = await auth();
		if (!session || !session.user?.email) {
			return Response.json({ message: "unauthorized" }, { status: 401 });
		}

		const user = await User.findOne({ email: session.user.email });
		if (!user) {
			return Response.json({ message: "user not found" }, { status: 401 });
		}

		const partnerBank = await PartnerBank.findOne({ owner: user._id });
		if (partnerBank) {
			return Response.json(partnerBank, { status: 200 });
		} else {
			return null;
		}
	} catch (error) {
		console.log("Get partner bank details error, err: ", error);
		return Response.json(
			{ message: "Get partner bank details error, err: ", error },
			{ status: 500 },
		);
	}
}
