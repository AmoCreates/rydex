import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/model/user.model";
import { NextRequest } from "next/server";

export async function GET(
	req: NextRequest,
	context: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth();
		if (!session || !session.user?.email || session.user.role !== "admin") {
			return Response.json({ message: "Unauthorized" }, { status: 401 });
		}

		await dbConnect();

		const partnerId = (await context.params).id;
		const partner = await User.findById(partnerId);

		if (!partner || partner.role !== "partner") {
			return Response.json({ message: "Partner not found" }, { status: 400 });
		}

    const roomId = `kyc-${partnerId}-${Date.now()}`
    partner.videoKycRoomId = roomId;
    partner.videoKycStatus = "in progress";
    await partner.save()

		return Response.json({ roomId }, { status: 200 });
	} catch (error) {
    console.log(error)
		return Response.json({message: "video kyc start error"}, {status: 500});
  }
}
