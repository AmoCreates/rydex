import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import PartnerBank from "@/model/partnerBank.model";
import User from "@/model/user.model";

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
    await user.save();

		if (user.partnerOnBoardingStep == 2) {
			user.partnerOnBoardingStep = 3;
		}

		return Response.json(partnerBank, { status: 201 });
	} catch (error) {
		console.log("partner bank details error, err: ", error);
		return Response.json(
			{ message: "partner bank details error, err: ", error },
			{ status: 500 },
		);
	}
}


export async function GET(req: Request) {
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