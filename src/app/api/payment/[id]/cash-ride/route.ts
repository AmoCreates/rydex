import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Booking from "@/model/booking.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
	req: NextRequest,
	context: { params: Promise<{ id: string }> },
) {
	try {
		await dbConnect();

		const session = await auth();

		if (
			!session ||
			!session.user?.email ||
			session.user.role !== "customer"
		) {
			return NextResponse.json(
				{ success: false, message: "unauthorized, please log in to payment" },
				{ status: 401 },
			);
		}

		const id = (await context.params).id;
		if (!id) {
			return NextResponse.json(
				{success: false, message: "missing id!, can't find any booking" },
				{ status: 400 },
			);
		}

		const booking = await Booking.findOne({
			_id: id,
			customer: session.user.id,
		});

		const allowedStatuses = ["awaiting payment"];

		if (!booking || !allowedStatuses.includes(booking.bookingStatus)) {
			return NextResponse.json(
				{
					success: false,
					message:
						"Sorry, we were unable to find any pending bookings",
				},
				{ status: 400 },
			);
		}

		booking.paymentStatus = "pending";
		booking.paymentMode = "cash";
		booking.bookingStatus = "confirmed"
		await booking.save();

		return NextResponse.json(
			{ success: true, message: "cash ride confirmed" },
			{ status: 200 },
		);
	} catch {
		return NextResponse.json(
			{
				success: false,
				message: "server error: failed to confirem cash ride",
			},
			{ status: 500 },
		);
	}
}

