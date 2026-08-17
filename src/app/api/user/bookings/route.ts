import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Booking from "@/model/booking.model";
import User from "@/model/user.model";
import Vehicle from "@/model/vehicle.model";
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
				{ success: false, message: "unauthorized, please log in" },
				{ status: 401 },
			);
		}

		const user = await User.findById(session.user.id);
		if (!user) {
			return NextResponse.json(
				{ success: false, message: "failed to fetch bookings, please login again" },
				{ status: 401 },
			);
		}

		const bookings = await Booking.find({
			customer: user._id,
		})
			.populate([
				{ path: "customer", model: User },
				{ path: "driver", model: User },
				{ path: "vehicle", model: Vehicle },
			])
			.sort({ createdAt: -1 });

		if (!bookings || bookings.length == 0) {
			return NextResponse.json(
				{ success: false, message: "no active booking found" },
				{ status: 200 },
			);
		}

		return NextResponse.json({ success: true, bookings }, { status: 200 });
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ message: "server error: failed to fetch bookings" },
			{ status: 500 },
		);
	}
}
