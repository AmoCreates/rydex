import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/model/user.model";
import Vehicle from "@/model/vehicle.model";

const VEHICLE_REGEX = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/;

export async function POST(req: Request) {
	try {
		await dbConnect();

		const session = await auth();
		if (!session || !session.user?.email) {
			return Response.json({ message: "unauthorized" }, { status: 401 });
		}

		const user = await User.findOne({ email: session.user.email });
		if (!user) {
			return Response.json(
				{ message: "user not found" },
				{ status: 401 },
			);
		}

		const { vehicleType, vehicleNumber, vehicleModel } = await req.json();

		if (!vehicleType || !vehicleModel || !vehicleNumber) {
			return Response.json(
				{ message: "missing required vehicle details" },
				{ status: 400 },
			);
		}

		if (!VEHICLE_REGEX.test(vehicleNumber)) {
			return Response.json(
				{ message: "invalid vehicle number format" },
				{ status: 400 },
			);
		}

		const vehicleNumberCapitalize = vehicleNumber.toUpperCase();

		let vehicle = await Vehicle.findOne({
			owner: user._id,
			vehicleNumber: vehicleNumberCapitalize,
		});
		if (vehicle) {
			vehicle.type = vehicleType;
			vehicle.vehicleModel = vehicleModel;
			vehicle.vehicleNumber = vehicleNumberCapitalize;
			vehicle.status = "pending";
			vehicle.isActive = false;

			await vehicle.save();

			user.partnerStatus = "pending";
			if (user.partnerOnBoardingStep >= 3) {
				user.partnerOnBoardingStep = 3;
			}
			user.videoKycRoomId = "";
			user.videoKycStatus = "not required";
			user.role = "partner";
			user.partnerStatus = "pending";
			await user.save();

			return Response.json(vehicle, { status: 200 });
		}

		const duplicate = await Vehicle.findOne({
			vehicleNumber: vehicleNumberCapitalize,
		});
		if (duplicate) {
			return Response.json(
				{ message: "Vehicle already registered" },
				{ status: 400 },
			);
		}

		vehicle = await Vehicle.create({
			owner: user._id,
			type: vehicleType,
			vehicleNumber: vehicleNumberCapitalize,
			vehicleModel,
			isActive: false,
		});

		if (user.partnerOnBoardingStep < 1) {
			user.partnerOnBoardingStep = 1;
			user.role = "partner";
			await user.save();
		}

		return Response.json(vehicle, { status: 201 });
	} catch  {
		return Response.json(
			{ message: "server error : Vehicle add/update error"},
			{ status: 500 },
		);
	}
}

export async function GET() {
	try {
		await dbConnect();

		const session = await auth();

		if (!session || !session.user?.email) {
			return Response.json(
				{ success: false, message: "unauthorized" },
				{ status: 401 },
			);
		}

		const user = await User.findOne({ email: session.user.email });
		if (!user) {
			return Response.json(
				{ success: false, message: "user not found" },
				{ status: 401 },
			);
		}

		const vehicle = await Vehicle.findOne({ owner: user._id });
		if (vehicle) {
			return Response.json(vehicle, { status: 200 });
		} else {
			return Response.json(
				{ success: false, message: "vehicle not found" },
				{ status: 404 },
			);
		}
	} catch (error) {
		console.log("Get vehicle details error, err: ", error);
		return Response.json(
			{
				success: false,
				message: "server error: failed to fetch vehicle details",
				error,
			},
			{ status: 500 },
		);
	}
}
