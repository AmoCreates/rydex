import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Booking from "@/model/booking.model";
import User from "@/model/user.model";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
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

		const { bookingId, otp } = await req.json();
		if (!bookingId || !otp) {
			return NextResponse.json(
				{ success: false, message: "otp and bookingId is required" },
				{ status: 400 },
			);
		}

		const booking = await Booking.findById(bookingId);
		if (!booking) {
			return NextResponse.json(
				{ success: false, message: "no booking found" },
				{ status: 401 },
			);
		}

		if (!booking.pickUpOtp) {
			return NextResponse.json(
				{ success: false, message: "pickup otp not generated yet" },
				{ status: 400 },
			);
		}

		if (booking.pickUpOtpExpires < new Date()) {
			return NextResponse.json(
				{ success: false, message: "otp expired" },
				{ status: 400 },
			);
		}

		if (booking.pickUpOtp !== otp) {
			return NextResponse.json(
				{ success: false, message: "invalid otp" },
			);
		}

		booking.bookingStatus = "started";
		booking.pickUpOtp = undefined;
		booking.pickUpOtpExpires = undefined;
		await booking.save();

		return NextResponse.json(
			{ success: true, message: "pickup otp verified successfully" },
			{ status: 200 },
		);
	} catch (error) {
		return NextResponse.json(
			{ success: false, message: "something went wrong, pickup otp verification failed", error },
			{ status: 500 },
		);
	}
}
