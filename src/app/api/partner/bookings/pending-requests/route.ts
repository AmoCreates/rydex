import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Booking from "@/model/booking.mode";
import User from "@/model/user.model";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		await dbConnect();

		const session = await auth();
		if (
			!session ||
			!session.user?.email ||
			session.user?.role !== "partner"
		) {
			return NextResponse.json(
				{ message: "unauthorized, please log in" },
				{ status: 401 },
			);
		}

		const partner = await User.findOne({email: session.user.email});
		if (!partner) {
			return NextResponse.json(
				{ message: "user not found" },
				{ status: 401 },
			);
		}

		const bookings = await Booking.find({ 
      driver: partner._id,
      bookingStatus: "requested",
    });
		return NextResponse.json(bookings, { status: 200 });
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ message: "find bookings error" },
			{ status: 500 },
		);
	}
}
