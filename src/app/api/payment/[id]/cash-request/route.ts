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
				{
					success: false,
					message: "unauthorized, please log in to payment",
				},
				{ status: 401 },
			);
		}

		const id = (await context.params).id;
		if (!id) {
			return NextResponse.json(
				{
					success: false,
					message: "missing id!, can't find any booking",
				},
				{ status: 400 },
			);
		}

		const booking = await Booking.findOne({
			_id: id,
			customer: session.user.id,
		});

		const allowedStatus = ["awaiting payment"];

		if (!booking || !allowedStatus.includes(booking.bookingStatus)) {
			return NextResponse.json(
				{
					success: false,
					message:
						"Sorry, for cash ride, customer only allowed to pay after dropped successfully",
				},
				{ status: 400 },
			);
		}

		booking.paymentStatus = "requested";
		booking.paymentMode = "cash";
		booking.bookingStatus = "awaiting payment";
		await booking.save();

		return NextResponse.json(
			{ success: true, message: "waiting for partner confirmation" },
			{ status: 200 },
		);
	} catch {
		return NextResponse.json(
			{
				success: false,
				message: "server error: failed to request cash",
			},
			{ status: 500 },
		);
	}
}
