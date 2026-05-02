import dbConnect from "@/lib/db";
import { sendMail } from "@/lib/sendMail";
import User from "@/model/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const { name, email, password } = await req.json();

		if (password.length < 6 || password.length > 15) {
			return NextResponse.json(
				{ message: "password must be in between 6-15 characters long" },
				{ status: 400 },
			);
		}

		await dbConnect();

		let user = await User.findOne({ email });
		if (user && user.isEmailVerified) {
			return NextResponse.json(
				{ message: "email already exists!" },
				{ status: 400 },
			);
		}

		const otp = Math.floor(100000 + Math.random() * 900000).toString();
		const otpExpiry = new Date();
		otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		if (user && !user.isEmailVerified) {
			user.otp = otp;
			user.otpExpiry = otpExpiry;
			user.password = hashedPassword;
			await user.save();
		} else {
			user = await User.create({
				name,
				email,
				password: hashedPassword,
				otp,
				otpExpiry,
			});
		}

		await sendMail(
			email,
			"Verify your RYDEX account",
			`Your verification code is ${otp}. It expires in 10 minutes.`,
			`
			<div style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow: auto; line-height: 2">
				<div style="margin: 50px auto; width: 70%; padding: 20px 0">
					<div style="border-bottom: 1px solid #eee">
						<a href="" style="font-size: 1.4em; color: #00466a; text-decoration: none; font-weight: 600">RYDEX</a>
					</div>
					<p style="font-size: 1.1em">Hi ${name},</p>
					<p>Thank you for choosing RYDEX. Use the following OTP to complete your Sign Up procedures. OTP is valid for 10 minutes</p>
					<h2 style="background: #00466a; margin: 0 auto; width: max-content; padding: 0 10px; color: #fff; border-radius: 4px;">${otp}</h2>
					<p style="font-size: 0.9em;">Regards,<br />RYDEX Team</p>
					<hr style="border: none; border-top: 1px solid #eee" />
					<div style="float: right; padding: 8px 0; color: #aaa; font-size: 0.8em; line-height: 1; font-weight: 300">
						<p>RYDEX Inc</p>
						<p>Global Headquarters</p>
						<p>India</p>
					</div>
				</div>
			</div>
			`
		)
		
		return NextResponse.json({ user }, { status: 201 });

	} catch (error) {
		return NextResponse.json(
			{ message: `registeration failed ${error}` },
			{ status: 500 },
		);
	}
}
