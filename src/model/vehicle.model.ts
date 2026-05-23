import mongoose from "mongoose";

type vehcileType =
	| "Bike"
	| "Car"
	| "Auto"
	| "Cargo"
	| "Loaders"
	| "Passenger"
	| "Other";

export interface IVehicle extends mongoose.Document {
	owner: mongoose.Types.ObjectId;
	type: vehcileType;
	vehicleModel: string;
	vehicleNumber: string;
	vehicleCondition: "Good" | "Fair" | "Poor";
	AC: boolean;
	imageUrl?: string;
	baseFare?: number;
	pricePerKM?: number;
	waitingChargerPerMin?: number;
	ownerStatus: "Approved" | "Rejected" | "Pending";
	isActive?: boolean;
	rejectionMsg?: string;
  rating?: number;
	createdAt?: Date; // no need to add these becaues extends above, only for more secureness
	updatedAt?: Date;
}

const vehicleSchema = new mongoose.Schema<IVehicle>({
	owner: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},

	type: {
		type: String,
		enum: ["Bike", "Car", "Auto", "Cargo", "Loaders", "Passenger", "Other"],
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
		enum: ["Good", "Fair", "Poor"],
	},

  rating: {
    type: Number,
    default: 0,
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  ownerStatus: {
    type: String,
    enum: ["Approved", "Rejected", "Pending"],
    default: "Pending",
  },

  imageUrl: String,

  baseFare: Number,

  pricePerKM: Number,

  waitingChargerPerMin: Number,

  rejectionMsg: String,
}, {timestamps: true});

const Vehicle = mongoose.models?.Vehicle || mongoose.model("Vehicle", vehicleSchema);
export default Vehicle;