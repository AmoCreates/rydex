import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import { sendMail } from "@/lib/sendMail";
import Booking from "@/model/booking.model";
import User from "@/model/user.model";
import Vehicle from "@/model/vehicle.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		await dbConnect();

		const session = await auth();
		if (
			!session ||
			!session.user?.email ||
			session.user?.role !== "partner"
		) {
			return NextResponse.json(
				{ success: false, message: "unauthorized, please log in" },
				{ status: 401 },
			);
		}

		const partner = await User.findById(session.user.id);
		if (!partner) {
			return NextResponse.json(
				{ success: false, message: "driver not found" },
				{ status: 401 },
			);
		}

		const { bookingId } = await req.json();
		if (!bookingId) {
			return NextResponse.json(
				{ success: false, message: "booking Id required" },
				{ status: 401 },
			);
		}

		const booking = await Booking.findById(bookingId).populate([
			{ path: "customer", model: User },
			{ path: "driver", model: User },
			{ path: "vehicle", model: Vehicle },
		]);

		if (!booking) {
			return NextResponse.json(
				{ success: false, message: "no booking found" },
				{ status: 401 },
			);
		}

		const otp = Math.floor(100000 + Math.random() * 900000).toString();
		const otpExpiry = new Date();
		otpExpiry.setMinutes(otpExpiry.getMinutes() + 5);

		booking.dropOtp = otp;
		booking.dropOtpExpires = otpExpiry;
		await booking.save();

		if (!booking.customer.email) {
			return NextResponse.json(
				{
					success: false,
					message: "unable to send email, no email Id found",
				},
				{ status: 401 },
			);
		}

    const customerName = booking.customer.name
		// const email = booking.customer.email;
		const email = "AmoCreates@outlook.com"
		const driverName = booking.driver.name;
		const dropAddress = booking.dropAddress;
		const vehicleDetails = `${booking.vehicle.type}, ${booking.vehicle.vehicleModel}, ${booking.vehicle.vehicleNumber}`;

		await sendMail(
			email,
			`Your RYDEX Drop Code: ${otp}`,
			`Your drop OTP is ${otp}. Share this with your driver (${driverName}) to start your trip.`,
			`
  <div style="background-color: #f0f2f5; padding: 40px 15px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.08);">
      
      <!-- Top Accent Bar -->
      <tr>
        <td style="background: linear-gradient(135deg, #00466a 0%, #006b9d 100%); padding: 6px;"></td>
      </tr>

      <!-- Brand Header -->
      <tr>
        <td style="padding: 32px 40px 10px 40px; text-align: center;">
          <div style="display: inline-block; padding: 10px 20px; background-color: #f8fafc; border-radius: 14px; border: 1px solid #e2e8f0;">
            <span style="font-size: 20px; font-weight: 800; color: #00466a; letter-spacing: 2px;">RYDEX</span>
          </div>
        </td>
      </tr>

      <!-- Main Heading -->
      <tr>
        <td style="padding: 15px 40px 0 40px; text-align: center;">
          <h2 style="color: #1a202c; font-size: 22px; font-weight: 700; margin: 0;">Ride Drop OTP</h2>
          <p style="color: #64748b; font-size: 14px; line-height: 22px; margin-top: 10px;">
            Hi <strong>${customerName}</strong>, your driver has arrived! Share the code below with your driver to start your ride.
          </p>
        </td>
      </tr>

      <!-- OTP Display Box -->
      <tr>
        <td style="padding: 25px 40px 15px 40px;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center">
                <div style="background: #f8fafc; border: 2px dashed #00466a; border-radius: 16px; padding: 18px; display: inline-block;">
                  <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #00466a; margin-left: 10px;">${otp}</span>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Ride Info Card (Optional details) -->
      <tr>
        <td style="padding: 0 40px 20px 40px;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 12px; padding: 16px; border: 1px solid #f1f5f9;">
            <tr>
              <td style="color: #475569; font-size: 13px; line-height: 20px;">
                🚗 <strong>Driver:</strong> ${driverName || "Your Assigned Driver"}<br>
                🚘 <strong>Vehicle:</strong> ${vehicleDetails || "RYDEX Cab"}<br>
                📍 <strong>Drop:</strong> ${dropAddress || "Your current location"}
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Security & Expiry Notice -->
      <tr>
        <td style="padding: 0 40px 25px 40px; text-align: center;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0; line-height: 18px;">
            This OTP expires in <span style="color: #ef4444; font-weight: 600;">5 minutes</span>.<br>
            ⚠️ Only share this code in person with your RYDEX driver.
          </p>
        </td>
      </tr>

      <!-- Clean Footer -->
      <tr>
        <td style="padding: 24px 40px; background-color: #f8fafc; text-align: center; border-top: 1px solid #f1f5f9;">
          <p style="color: #64748b; font-size: 13px; margin: 0; font-weight: 600;">Have a safe trip with RYDEX!</p>
          <div style="margin-top: 10px;">
            <a href="#" style="color: #94a3b8; text-decoration: none; font-size: 12px; margin: 0 8px;">Help & Support</a> •
            <a href="#" style="color: #94a3b8; text-decoration: none; font-size: 12px; margin: 0 8px;">Safety Center</a>
          </div>
        </td>
      </tr>
    </table>

    <!-- Outer Footer -->
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px;">
      <tr>
        <td style="padding-top: 20px; text-align: center; color: #94a3b8; font-size: 11px;">
          © 2026 RYDEX Inc. • Safe & Reliable Rides
        </td>
      </tr>
    </table>
  </div>
  `,
		);

		return NextResponse.json(
			{ success: true, message: "drop otp sent successfully" },
			{ status: 200 },
		);
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ success: false, message: "drop OTP generation failed" },
			{ status: 500 },
		);
	}
}
