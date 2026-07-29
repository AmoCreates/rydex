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
				{ success: false, message: "unauthorized, please log in" },
				{ status: 401 },
			);
		}

		const partner = await User.findById(session.user.id);
		if (!partner) {
			return NextResponse.json(
				{ success: false, message: "user not found" },
				{ status: 401 },
			);
		}

		const booking = await Booking.findOne({
			driver: partner._id,
			bookingStatus: {
				$in: [
					"awaiting pickup",
					"started",
					"completed",
					"awaiting payment",
				],
			},
		});

		if (!booking || booking.length == 0) {
			return NextResponse.json(
				{ success: false, message: "no active booking found" },
				{ status: 200 },
			);
		}

		return NextResponse.json({ success: true, booking }, { status: 200 });
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ message: "find partner's acitve booking error" },
			{ status: 500 },
		);
	}
}
