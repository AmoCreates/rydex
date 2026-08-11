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
				$in: ["awaiting payment", "confirmed", "started"],
			},
		}).populate([
			{ path: "customer", model: User },
			{ path: "driver", model: User },
			{ path: "vehicle", model: Vehicle },
		]);

		if (!booking) {
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
