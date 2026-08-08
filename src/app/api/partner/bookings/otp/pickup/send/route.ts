import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Booking from "@/model/booking.model";
import User from "@/model/user.model";
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

		const booking = await Booking.findById(bookingId).populate("customer");

		if (!booking) {
			return NextResponse.json(
				{ success: false, message: "no booking found" },
				{ status: 401 },
			);
		}

		const otp = Math.floor(100000 + Math.random() * 900000).toString();
		const otpExpiry = new Date();
		otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

    booking.pickUpOtp = otp;
    booking.pickUpOtpExpires = otpExpiry;
    await booking.save();

	} catch (error) {
    console.log(error);
    return NextResponse.json(
				{ success: false, message: "pickup OTP generation failed" },
				{ status: 500 },
			);
  }
}
