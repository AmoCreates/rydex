import { auth } from "@/auth";
import dbConnect from "@/lib/db";
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
			return Response.json({ message: "Unauthorized" }, { status: 401 });
		}

		await dbConnect();

		const vehicleId = (await context.params).id;
		const vehicle = await Vehicle.findById(vehicleId).populate("owner");
		if (!vehicle) {
			return Response.json({ message: "Vehicle not found" }, { status: 400 });
		}

		const partner = await User.findById(vehicle.owner);
		if (!partner) {
			return Response.json({ message: "partner not found" }, { status: 400 });
		}

		return Response.json(
			{
				vehicle,
				partner,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.log(error);
		return Response.json(
			{ message: "Partner pricing & vehicle get error" },
			{ status: 500 },
		);
	}
}
