import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/model/user.model";
import Vehicle from "@/model/vehicle.model";
import { NextRequest } from "next/server";

export async function PUT(
	req: NextRequest,
	context: { params: Promise<{ id: string }> },
) {
	const session = await auth();
	if (!session || !session.user?.email || session.user.role !== "admin") {
		return Response.json({ message: "Unauthorized" }, { status: 401 });
	}

	try {
		await dbConnect();

		const { vehicleStatus, reason } = await req.json();
		if (!vehicleStatus) {
			return Response.json({ message: "Invalid request" }, { status: 400 });
		}

		if (vehicleStatus === "rejected" && !reason) {
			return Response.json(
				{ message: "Rejection reason is required" },
				{ status: 400 },
			);
		}

		const vehicleId = (await context.params).id;
		const vehicle = await Vehicle.findById(vehicleId);
		//find partner and update partner too
		const partner = await User.findById(vehicle.owner);

		if (!vehicle) {
			return Response.json({ message: "vehicle not found" }, { status: 400 });
		}
		if (!partner) {
			return Response.json({ message: "partner not found" }, { status: 400 });
		}

		if (vehicleStatus === "approved") {
			if (vehicle.status === "approved") {
				return Response.json(
					{ message: "Vehicle already approved" },
					{ status: 400 },
				);
			}

			vehicle.status = "approved";
			vehicle.rejectionMsg = undefined;
			await vehicle.save();

			//updating partner details
			partner.partnerStatus = "approved";
			partner.partnerOnBoardingStep = 8;
			partner.rejectionMsg = undefined;
			await partner.save();

			return Response.json({ message: "Partner approved" }, { status: 200 });
		} else if (vehicleStatus === "rejected") {
			if (vehicle.status === "rejected") {
				return Response.json(
					{ message: "vehicle already rejected" },
					{ status: 400 },
				);
			}
      vehicle.status = "rejected";
      vehicle.rejectionMsg = reason;
			await vehicle.save();

			return Response.json({ message: "Partner rejected" }, { status: 200 });
		} else {
			return Response.json({ message: "Invalid status" }, { status: 400 });
		}
	} catch (error) {
		console.log(error);
		return Response.json(
			{
				message: "vehicle confirmation failed",
			},
			{ status: 500 },
		);
	}
}
