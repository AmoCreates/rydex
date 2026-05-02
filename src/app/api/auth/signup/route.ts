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
			<div style="background-color: #f0f2f5; padding: 50px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    		<table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.08);">
        
					<!-- Animated-style Top Bar -->
					<tr>
							<td style="background: linear-gradient(135deg, #00466a 0%, #006b9d 100%); padding: 6px;"></td>
					</tr>

					<!-- Brand Header -->
					<tr>
							<td style="padding: 40px 40px 20px 40px; text-align: center;">
									<div style="display: inline-block; padding: 12px 24px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
											<span style="font-size: 22px; font-weight: 800; color: #00466a; letter-spacing: 2px;">RYDEX</span>
									</div>
							</td>
					</tr>

					<!-- Main Content -->
					<tr>
							<td style="padding: 20px 40px 0 40px; text-align: center;">
									<h2 style="color: #1a202c; font-size: 24px; font-weight: 700; margin: 0;">Verification Code</h2>
									<p style="color: #64748b; font-size: 15px; line-height: 24px; margin-top: 16px;">
											Hi <strong>${name}</strong>, use the code below to securely sign in to your RYDEX account.
									</p>
							</td>
					</tr>

					<!-- Modern OTP Display -->
					<tr>
							<td style="padding: 30px 40px;">
									<table width="100%" border="0" cellspacing="0" cellpadding="0">
											<tr>
													<td align="center">
															<div style="background: #ffffff; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 20px; display: inline-block;">
																	<span style="font-family: 'Courier New', Courier, monospace; font-size: 42px; font-weight: 700; letter-spacing: 12px; color: #00466a; margin-left: 12px;">${otp}</span>
															</div>
													</td>
											</tr>
									</table>
							</td>
					</tr>

					<!-- Security Notice -->
					<tr>
							<td style="padding: 0 40px 30px 40px; text-align: center;">
									<p style="color: #94a3b8; font-size: 13px; margin: 0;">
											This code expires in <span style="color: #ef4444; font-weight: 600;">10 minutes</span>. 
											<br>If you didn't request this, you can safely ignore this email.
									</p>
							</td>
					</tr>

					<!-- Clean Footer -->
					<tr>
							<td style="padding: 30px 40px; background-color: #f8fafc; text-align: center; border-top: 1px solid #f1f5f9;">
									<p style="color: #64748b; font-size: 14px; margin: 0; font-weight: 500;">Team RYDEX</p>
									<div style="margin-top: 12px;">
											<a href="#" style="color: #94a3b8; text-decoration: none; font-size: 12px; margin: 0 10px;">Help Center</a>
											<a href="#" style="color: #94a3b8; text-decoration: none; font-size: 12px; margin: 0 10px;">Privacy Policy</a>
									</div>
							</td>
					</tr>
				</table>
			
				<!-- Outer Footer -->
				<table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px;">
						<tr>
								<td style="padding-top: 24px; text-align: center; color: #94a3b8; font-size: 12px;">
										© 2026 RYDEX Inc. • Global Headquarters, India
								</td>
						</tr>
				</table>
			</div>
			`,
		);

		return NextResponse.json({ user }, { status: 201 });
	} catch (error) {
		return NextResponse.json(
			{ message: `registeration failed ${error}` },
			{ status: 500 },
		);
	}
}
