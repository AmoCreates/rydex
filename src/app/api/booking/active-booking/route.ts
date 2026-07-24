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
			session.user?.role !== "customer"
		) {
			return NextResponse.json(
				{ message: "unauthorized, please log in" },
				{ status: 401 },
			);
		}

		const customer = await User.findById(session.user.id);
		if (!customer) {
			return NextResponse.json(
				{ message: "user not found" },
				{ status: 401 },
			);
		}

		const booking = await Booking.find({
			customer: customer._id,
			bookingStatus: {
				$in: [
					"requested",
					"awaiting pickup",
					"started",
					"completed",
					"awaiting payment",
				],
			},
		});

		if (!booking || booking.length == 0) {
			return NextResponse.json(
				{ message: "no previous booking found" },
				{ status: 200 },
			);
		}

		return NextResponse.json(booking, { status: 200 });
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ message: "find customer's acitve booking error" },
			{ status: 500 },
		);
	}
}
