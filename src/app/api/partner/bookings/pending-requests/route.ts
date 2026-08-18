import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Booking from "@/model/booking.model";
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
				{ message: "Please login again" },
				{ status: 401 },
			);
		}

		const bookings = await Booking.find({ 
      driver: partner._id,
      bookingStatus: "requested",
    });
		return NextResponse.json(bookings, { status: 200 });
	} catch {
		return NextResponse.json(
			{ message: "server error: failed to fetch pending bookings" },
			{ status: 500 }
		);
	}
}
