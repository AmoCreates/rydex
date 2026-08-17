import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import PartnerBank from "@/model/partnerBank.model";
import PartnerDocs from "@/model/partnerDocs.model";
import User from "@/model/user.model";
import Vehicle from "@/model/vehicle.model";
import { NextRequest } from "next/server";

export async function PUT(
	req: NextRequest,
	context: { params: Promise<{ id: string }> },
) {
	const session = await auth();
	if (!session || !session.user?.email || session.user.role !== "admin") {
		return Response.json(
			{ success: false, message: "Unauthorized" },
			{ status: 401 },
		);
	}

	try {
		await dbConnect();

		const { partnerStatus, reason } = await req.json();
		if (!partnerStatus) {
			return Response.json(
				{ success: false, message: "Invalid request" },
				{ status: 400 },
			);
		}

		if (partnerStatus === "rejected" && !reason) {
			return Response.json(
				{ success: false, message: "Rejection reason is required" },
				{ status: 400 },
			);
		}

		const partnerId = (await context.params).id;
		const partner = await User.findById(partnerId);

		if (!partner || partner.role !== "partner") {
			return Response.json(
				{ success: false, message: "Partner not found" },
				{ status: 400 },
			);
		}

		if (partnerStatus === "approved") {
			if (partner.partnerStatus === "approved") {
				return Response.json(
					{ success: false, message: "Partner already approved" },
					{ status: 400 },
				);
			}

			const vehicle = await Vehicle.findOne({ owner: partnerId });
			const documents = await PartnerDocs.findOne({ owner: partnerId });
			const bank = await PartnerBank.findOne({ owner: partnerId });
			if (!vehicle || !documents || !bank) {
				return Response.json(
					{
						success: false,
						message: "Partner may not completed onboarding steps",
					},
					{ status: 400 },
				);
			}

			vehicle.status = "approved";
			await vehicle.save();
			documents.status = "approved";
			await documents.save();
			bank.status = "verified";
			await bank.save();

			partner.partnerStatus = "pending";
			partner.videoKycStatus = "pending";
			partner.partnerOnBoardingStep = 4;
			partner.rejectionMsg = "";
			await partner.save();

			return Response.json(
				{success: true, message: "Partner approved" },
				{ status: 200 },
			);
		} else if (partnerStatus === "rejected") {
			if (partner.partnerStatus === "rejected") {
				return Response.json(
					{
						success: false,
						message:
							"Partner already rejected, please go back to dashboard and refresh the page",
					},
					{ status: 400 },
				);
			}
			partner.partnerStatus = "rejected";
			partner.rejectionMsg = reason;
			await partner.save();
			return Response.json(
				{ success: true, message: "Partner rejected" },
				{ status: 200 },
			);
		} else {
			return Response.json(
				{ success: false, message: "Invalid status" },
				{ status: 400 },
			);
		}
	} catch (error) {
		console.log(error);
		return Response.json(
			{
				message: "server error: partner confirmation failed",
			},
			{ status: 500 },
		);
	}
}
