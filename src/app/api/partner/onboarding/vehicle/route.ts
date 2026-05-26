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
			return Response.json({ message: "user not found" }, { status: 401 });
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
				{ message: "invalide vehicle number format" },
				{ status: 400 },
			);
		}

		const vehicleNumberCapitalize = vehicleNumber.toUpperCase();

		const duplicate = await Vehicle.findOne({
			vehicleNumber: vehicleNumberCapitalize,
		});
		if (duplicate) {
			return Response.json(
				{ message: "Vehicle already registered" },
				{ status: 400 },
			);
		}

		let vehicle = await Vehicle.findOne({ owner: session.user.id });
		if (vehicle) {
			vehicle.type = vehicleType;
			vehicle.vehicleModel = vehicleModel;
			vehicle.vehicleNumber = vehicleNumberCapitalize;
			vehicle.status = "pending";
			await vehicle.save();

			return Response.json(vehicle, { status: 200 });
		}

		vehicle = await Vehicle.create({
			owner: user._id,
			type: vehicleType,
			vehicleNumber: vehicleNumberCapitalize,
			vehicleModel,
		});

		if (user.partnerOnBoardingStep < 1) {
			user.partnerOnBoardingStep = 1;
		}

		// user.role = "partner"
		// await user.save();

		return Response.json(vehicle, { status: 201 });
	} catch (error) {
		console.log("vehicle add/update error, err: ", error)
		return Response.json(
			{ message: "Vehicle add/update error, err: ", error },
			{ status: 500 },
		);
	}
}

export async function GET(req: Request) {
	try {
		await dbConnect();

		const session = await auth();

		if (!session || !session.user?.email) {
			return Response.json({ message: "unauthorize" }, { status: 401 });
		}

		const user = await User.findOne({ email: session.user.email });
		if (!user) {
			return Response.json({ message: "user not found" }, { status: 401 });
		}

		const vehicle = await Vehicle.findOne({ owner: user._id });
		if (vehicle) {
			return Response.json(vehicle, { status: 200 });
		} else {
			return null;
		}
	} catch (error) {
		console.log("Get vehicle details error, err: ",error)
		return Response.json(
			{ message: "Get vehicle details error, err: ", error },
			{ status: 500 },
		);
	}
}