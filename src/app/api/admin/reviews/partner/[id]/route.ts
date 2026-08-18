import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import PartnerBank from "@/model/partnerBank.model";
import PartnerDocs from "@/model/partnerDocs.model";
import User from "@/model/user.model";
import Vehicle from "@/model/vehicle.model";
import { NextRequest } from "next/server";

export async function GET(
	req: NextRequest,
	context: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth();
		if (!session || !session.user?.email || session.user.role !== "admin") {
			return Response.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 },
			);
		}

		await dbConnect();

		const partnerId = (await context.params).id;
		const partner = await User.findById(partnerId);

		if (!partner || partner.role !== "partner") {
			return Response.json(
				{ success: false, message: "Partner not found!, This may be a false sign" },
				{ status: 400 },
			);
		}

		const vehicle = await Vehicle.findOne({ owner: partnerId });
		const documents = await PartnerDocs.findOne({ owner: partnerId });
		const bank = await PartnerBank.findOne({ owner: partnerId });

		return Response.json(
			{
				success: true,
				partner,
				vehicle: vehicle || null,
				documents: documents || null,
				bank: bank || null,
			},
			{ status: 200 },
		);
	} catch {
		return Response.json(
			{
				success: false,
				message:
					"server error: failed to load partner onboarding details",
			},
			{ status: 500 },
		);
	}
}
