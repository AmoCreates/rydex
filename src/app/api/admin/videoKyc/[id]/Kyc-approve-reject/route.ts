import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/model/user.model";

export async function PATCH(req: Request) {
	try {
		const session = await auth();
		if (!session || !session.user?.email || session.user.role !== "admin") {
			return Response.json({ message: "Unauthorized" }, { status: 401 });
		}

		await dbConnect();

		const { roomId, action, reason } = await req.json();
		if (!roomId) {
			return Response.json({ message: "roomId is required" }, { status: 400 });
		}
		if (!action) {
			if (!["approve", "reject"].includes(action)) {
				return Response.json(
					{ message: "action is required" },
					{ status: 400 },
				);
			} else {
				return Response.json(
					{ message: "Admin action is required" },
					{ status: 400 },
				);
			}
		}
		if (action === "reject" && !reason && reason.trim() === ""){
			return Response.json({ message: "reason is required" }, { status: 400 });
		}

		const partner = await User.findOne({
			videoKycRoomId: roomId,
			role: "partner",
		});

		if (!partner || partner.role !== "partner") {
			return Response.json({ message: "Partner not found" }, { status: 400 });
		}

		if (
			partner.partnerOnBoardingStep !== 4 ||
			partner.videoKycStatus !== "in progress"
		) {
			return Response.json(
				{ message: "partner may not reviewed by Admin" },
				{ status: 400 },
			);
		}

		// Action On Reject
		if (action === "reject") {
			partner.partnerStatus = "rejected";
			partner.videoKycStatus = "rejected";
			partner.videoKycRoomId = "";
			partner.rejectionMsg = reason.trim();
			await partner.save();

			return Response.json({ message: "partner rejected" }, { status: 200 });
		}
		// Action On Approve
		else if (action === "approve") {
			partner.partnerStatus = "pending";
			partner.videoKycStatus = "approved";
			partner.rejectionMsg = undefined;
			partner.partnerOnBoardingStep = 5;
			await partner.save();

			return Response.json({ message: "partner rejected" }, { status: 200 });
		}
		// Invalid Action by Admin
		else {
			return Response.json(
				{ message: "Invalid action by Admin" },
				{ status: 400 },
			);
		}
	} catch {

		return Response.json({ message: "Admin action error" }, { status: 500 });
	}
}
