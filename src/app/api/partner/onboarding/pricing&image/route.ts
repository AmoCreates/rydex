import { auth } from "@/auth";
import cloudinaryUpload from "@/lib/cloudinary";
import dbConnect from "@/lib/db";
import User from "@/model/user.model";
import Vehicle from "@/model/vehicle.model";

export async function POST(req: Request) {
	try {
		await dbConnect();

		const session = await auth();
		if (!session || !session.user?.email || session.user.role !== "partner") {
			return Response.json({ message: "unauthorized" }, { status: 401 });
		}

		const partner = await User.findOne({ email: session.user.email });
		if (!partner) {
			return Response.json({ message: "parnter not found" }, { status: 401 });
		}

		// Handle 'undefined' or '0' values robustly
		if (!partner.partnerOnBoardingStep || partner.partnerOnBoardingStep < 5) {
			return Response.json(
				{
					message: "please complete previous steps",
				},
				{ status: 400 },
			);
		}

		const formData = await req.formData();
		const imageFile = formData.get("image") as Blob | null;
		const AC = formData.get("AC") as boolean | null;
		const vehicleCondition = formData.get("vehicleCondition") as string | null;
		const baseFare = formData.get("baseFare") as number | null;
		const pricePerKM = formData.get("pricePerKM") as number | null;
		const waitingChargerPerMin = formData.get("waitingChargerPerMin") as
			| number
			| null;

		if (
			!vehicleCondition ||
			!baseFare ||
			!pricePerKM ||
			!waitingChargerPerMin ||
			!imageFile
		) {
			return Response.json(
				{
					message: "missing required fields",
				},
				{ status: 400 },
			);
		}

		const updatePayload: any = {
			status: "pending",
			AC: AC,
			vehicleCondition: vehicleCondition,
			baseFare: baseFare,
			pricePerKM: pricePerKM,
			waitingChargerPerMin: waitingChargerPerMin,
		};

		if (imageFile && imageFile.size > 0) {
			const url = await cloudinaryUpload(imageFile);
			if (!url) {
				return Response.json(
					{
						message: "Image upload failed",
					},
					{ status: 500 },
				);
			}
			updatePayload.imageUrl = url;
		}

		const vehicle = await Vehicle.findOneAndUpdate(
			{ owner: partner._id },
			{ $set: updatePayload },
			{ upsert: true, new: true, runValidators: true },
		);

		if (!vehicle) {
			return Response.json(
				{
					message: "Vehicle not found",
				},
				{ status: 500 },
			);
		}

		if (
			partner.partnerOnBoardingStep < 6 &&
			partner.partnerOnBoardingStep >= 5
		) {
			partner.partnerOnBoardingStep = 6;
		}
		await partner.save();

		return Response.json(vehicle, { status: 200 });
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";
		console.error("Vehicle upload error details:", error);
		return Response.json(
			{ message: "Upload vehicle error", error: errorMessage },
			{ status: 500 },
		);
	}
}

export async function GET() {
	try {
		await dbConnect();

		const session = await auth();
		if (!session || !session.user?.email || session.user.role !== "partner") {
			return Response.json({ message: "unauthorized" }, { status: 401 });
		}

		const partner = await User.findOne({ email: session.user.email });
		if (!partner) {
			return Response.json({ message: "parnter not found" }, { status: 401 });
		}

		// Handle 'undefined' or '0' values robustly
		if (!partner.partnerOnBoardingStep || partner.partnerOnBoardingStep < 5) {
			return Response.json(
				{
					message: "please complete previous steps",
				},
				{ status: 400 },
			);
		}

		const vehicle = await Vehicle.findOne({ owner: partner._id });
		if (!vehicle) {
			return Response.json(
				{
					message: "Vehicle not found",
				},
				{ status: 404 },
			);
		}

		return Response.json(vehicle, { status: 200 });
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";
		console.error("Get vehicle details err :", error);
		return Response.json(
			{ message: "Get vehicle error", error: errorMessage },
			{ status: 500 },
		);
	}
}
