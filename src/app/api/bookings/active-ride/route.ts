import { auth } from "@/auth";
import dbConnect from "@/lib/db";
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

		const { bookingId } = await req.json();
		if (!bookingId) {
			return NextResponse.json(
				{ message: "bookingId Required" },
				{ status: 401 },
			);
		}

		const booking = await Booking.findById(bookingId)
			.populate([
				{ path: "customer", model: User },
				{ path: "driver", model: User },
				{ path: "vehicle", model: Vehicle },
			])
			.sort({ createdAt: -1 });

		if (!booking || booking.length == 0) {
			return NextResponse.json(
				{ message: "no previous booking found" },
				{ status: 200 },
			);
		}

		return NextResponse.json({ success: true, booking }, { status: 200 });
	} catch  {
		return NextResponse.json(
			{ message: "get active ride for customer error" },
			{ status: 500 },
		);
	}
}


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

		const customer = await User.findOne({ email: session.user.email });
		if (!customer) {
			return NextResponse.json(
				{ message: "user not found" },
				{ status: 401 },
			);
		}

		const booking = await Booking.findOne({
			customer: customer._id,
			bookingStatus: {
				$in: [
					"requested",
					"started",
					"confirmed",
					"awaiting payment",
				],
			},
		});

		if (!booking) {
			return NextResponse.json(
				{ message: "no previous booking found" },
				{ status: 404 },
			);
		}

		return NextResponse.json(booking, { status: 200 });
	} catch {
		return NextResponse.json(
			{ message: "find customer's acitve booking error" },
			{ status: 500 },
		);
	}
}