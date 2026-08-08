import mongoose from "mongoose";

export type vehicleType =
	| "bike"
	| "car"
	| "auto"
	| "cargo"
	| "loaders"
	| "passenger";

export interface IVehicle extends mongoose.Document {
	owner: mongoose.Types.ObjectId;
	type: vehicleType;
	vehicleModel: string;
	vehicleNumber: string;
	vehicleCondition?: "good" | "fair" | "poor";
	AC?: boolean;
	imageUrl?: string;
	baseFare?: number;
	pricePerKM?: number;
	waitingChargerPerMin?: number;
	status?: "approved" | "rejected" | "pending";
	isActive?: boolean;
	rejectionMsg?: string;
	rating?: number;
	createdAt?: Date; // no need to add these becaues extends above, only for more secureness
	updatedAt?: Date;
}

const vehicleSchema = new mongoose.Schema<IVehicle>(
	{
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

		type: {
			type: String,
			enum: ["bike", "car", "auto", "cargo", "loaders", "passenger"],
			required: true,
		},

		AC: {
			type: Boolean,
			default: false,
		},

		vehicleModel: {
			type: String,
			required: true,
		},

		vehicleNumber: {
			type: String,
			required: true,
			unique: true,
		},

		vehicleCondition: {
			type: String,
			enum: ["good", "fair", "poor"],
		},

		rating: {
			type: Number,
			default: 0,
		},

		isActive: {
			type: Boolean,
			default: false,
		},

		status: {
			type: String,
			enum: ["approved", "rejected", "pending"],
			default: "pending",
		},

		imageUrl: String,
		baseFare: Number,
		pricePerKM: Number,
		waitingChargerPerMin: Number,
		rejectionMsg: String,
	},
	{ timestamps: true },
);

const Vehicle =
	mongoose.models?.Vehicle || mongoose.model("Vehicle", vehicleSchema);
export default Vehicle;
