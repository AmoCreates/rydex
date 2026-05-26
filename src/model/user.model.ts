import mongoose from "mongoose";

// extends with mongoose doucment will resolve the upcoming id type and timestamps
export interface IUser extends mongoose.Document {
	name: string;
	email: string;
	isEmailVerified?: boolean;
	otp?: string;
	otpExpiry?: Date;
	password?: string;
	mobile?: number;
	partnerOnBoardingStep?: number;
	role: "customer" | "partner" | "admin";
	createdAt?: Date; // no need to add these becaues extends above, only for more secureness
	updatedAt?: Date;
}

const userSchema = new mongoose.Schema<IUser>(
	{
		name: {
			type: String,
			required: true,
		},

		email: {
			type: String,
			required: true,
			unique: true,
		},

		isEmailVerified: {
			type: Boolean,
			default: false,
		},

		otp: {
			type: String,
			required: false,
		},

		otpExpiry: {
			type: Date,
			required: false,
		},

		password: {
			type: String,
			required: false,
		},

		mobile: {
			type: Number,
			required: false,
		},

		partnerOnBoardingStep: {
			type: Number,
			min: 0,
			max: 8,
			default: 0,
		},

		role: {
			type: String,
			default: "customer",
			enum: ["customer", "partner", "admin"],
		},
	},
	{ timestamps: true },
);

const User = mongoose.models?.User || mongoose.model("User", userSchema);
export default User;
