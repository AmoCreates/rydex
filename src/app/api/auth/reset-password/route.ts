import dbConnect from "@/lib/db";
import User from "@/model/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const { email, otp, password } = await req.json();

		if (!email || !otp || !password) {
			return NextResponse.json(
				{ message: "Email, OTP, and new password are required" },
				{ status: 400 },
			);
		}

		if (password.length < 6 || password.length > 15) {
			return NextResponse.json(
				{ message: "Password must be between 6 and 15 characters long" },
				{ status: 400 },
			);
		}

		await dbConnect();

		const user = await User.findOne({ email });
		if (!user) {
			return NextResponse.json(
				{ message: "User not found" },
				{ status: 404 },
			);
		}

		if (!user.otp || !user.otpExpiry) {
			return NextResponse.json(
				{ message: "No OTP was requested for this account" },
				{ status: 400 },
			);
		}

		if (user.otpExpiry < new Date()) {
			return NextResponse.json(
				{ message: "OTP has expired. Please request a new one" },
				{ status: 400 },
			);
		}

		if (user.otp !== otp) {
			return NextResponse.json(
				{ message: "Invalid OTP" },
				{ status: 400 },
			);
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		user.password = hashedPassword;
		user.otp = undefined;
		user.otpExpiry = undefined;
		await user.save();

		return NextResponse.json(
			{ message: "Password reset successfully" },
			{ status: 200 },
		);
	} catch (error) {
		return NextResponse.json(
			{ message: `Failed to reset password: ${error}` },
			{ status: 500 },
		);
	}
}
