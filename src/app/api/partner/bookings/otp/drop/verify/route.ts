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
			return Response.json(
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

		if (!booking.dropOtp) {
			return NextResponse.json(
				{ success: false, message: "drop otp not generated yet" },
				{ status: 400 },
			);
		}

		if (booking.dropOtpExpires < new Date()) {
			return NextResponse.json(
				{ success: false, message: "otp expired" },
				{ status: 400 },
			);
		}

		if (booking.dropOtp !== otp) {
			return NextResponse.json({
				success: false,
				message: "invalid otp",
			});
		}


		booking.bookingStatus = booking.paymentStatus === "paid" ? "completed" : "awaiting payment";
		booking.dropOtp = undefined;
		booking.dropOtpExpires = undefined;
		await booking.save();

		return NextResponse.json(
			{ success: true, booking, message: "drop otp verified successfully" },
			{ status: 200 },
		);
	} catch (error) {
		return NextResponse.json(
			{
				message: "something went wrong, drop otp verification failed",
				error,
			},
			{ status: 500 },
		);
	}
}
