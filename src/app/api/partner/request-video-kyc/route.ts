import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/model/user.model";

export async function PATCH() {
	try {
		await dbConnect();

		const session = await auth();
		if (!session || !session.user?.email || session.user.role !== "partner") {
			return Response.json({ message: "unauthorized" }, { status: 401 });
		}

		const partner = await User.findOne({ email: session.user.email });
		if (!partner) {
			return Response.json({ message: "partner not found" }, { status: 401 });
		}

		partner.partnerStatus = "pending";
		partner.videoKycStatus = "pending";
		partner.rejectionMsg = "";
		await partner.save();

		return Response.json(
			{ message: "Video KYC Request sent successfully" },
			{ status: 200 },
		);
	} catch (error) {
		console.log(error);
		return Response.json(
			{ message: "Video KYC Request error, err: ", error },
			{ status: 500 },
		);
	}
}
