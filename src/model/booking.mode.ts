import mongoose from "mongoose";

type BookingStatus =
	| "idle"
	| "requested"
	| "awaiting pickup"
	| "started"
	| "completed"
	| "awaiting payment"
	| "confirmed"
	| "cancelled"
	| "rejected"
	| "expired";

type PaymentStatus = "idle" | "pending" | "paid" | "failed";

export interface IBooking extends mongoose.Document {
	customer: mongoose.Types.ObjectId;
	driver: mongoose.Types.ObjectId;
	vehicle: mongoose.Types.ObjectId;

	pickUpAddress: string;
	dropAddress: string;

	pickUpLocation: {
		type: "Point";
		coordinates: [number, number];
	};
	dropLocation: {
		type: "Point";
		coordinates: [number, number];
	};

	distance: number;

	fare: number;

	customerMobile: string;
	customerName: string;
	driverMobile: string;

	bookingStatus: BookingStatus;
	paymentStatus: PaymentStatus;

	paymentMode: "cash" | "online";
	isCashReceived?: boolean;
	paymentDeadline: Date;

	adminCommission: number;
	partnerAmount: number;

	pikcUpOtp: string;
	pickUpOtpExpires: Date;
	dropOtp: string;
	dropOtpExpires: Date;

	createdAt?: Date;
	updatedAt?: Date;
}

const bookingSchema = new mongoose.Schema<IBooking>(
	{
		customer: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

		driver: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

		vehicle: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Vehicle",
			required: true,
		},

		pickUpAddress: {
			type: String,
			required: true,
		},

		dropAddress: {
			type: String,
			required: true,
		},

		pickUpLocation: {
			type: {
				type: String,
				enum: ["Point"],
			},
			coordinates: [Number],
		},

		dropLocation: {
			type: {
				type: String,
				enum: ["Point"],
			},
			coordinates: [Number],
		},

		distance: {
			type: Number,
			required: true,
		},

		fare: {
			type: Number,
			required: true,
		},

		customerMobile: {
			type: String,
			required: true,
		},

		customerName: {
			type: String,
			required: true,
		},

		driverMobile: {
			type: String,
			required: true,
		},

		bookingStatus: {
			type: String,
			enum: [
				"idle",
				"requested",
				"awaiting pickup",
				"started",
				"completed",
				"awaiting payment",
				"confirmed",
				"cancelled",
				"rejected",
				"expired",
			],
			default: "idle",
		},

		paymentStatus: {
			type: String,
			enum: ["idle", "pending", "paid", "failed"],
			default: "pending",
		},

		paymentMode: {
			type: String,
			enum: ["cash" , "online"],
			default: "cash"
		},

		isCashReceived: {
			type: Boolean,
			default: false,
		},

		paymentDeadline : {
			type: Date
		}, 

		adminCommission: {
			type: Number,
			default: 0,
		},

		partnerAmount: {
			type: Number,
			default: 0,
		},

		pikcUpOtp: String,
		dropOtp: String,

		pickUpOtpExpires: Date,
		dropOtpExpires: Date,
	},
	{ timestamps: true },
);

const Booking =
	mongoose.models?.Booking || mongoose.model("Booking", bookingSchema);
export default Booking;
