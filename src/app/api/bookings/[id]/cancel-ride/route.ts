import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Booking from "@/model/booking.model";
import axios from "axios";
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
				{ message: "unauthorized, please log in to cancel ride" },
				{ status: 401 },
			);
		}

		const id = (await context.params).id;
		if (!id) {
			return NextResponse.json(
				{ message: "missing id!, can't find any booking" },
				{ status: 400 },
			);
		}

		const booking = await Booking.findOne({
			_id: id,
			customer: session.user.id,
		});

		const allowedStatuses = ["requested"];

		if (!booking || !allowedStatuses.includes(booking.bookingStatus)) {
			return NextResponse.json(
				{
					message:
						"Sorry, we couldn't find any requested or current started ride",
				},
				{ status: 404 },
			);
		}

		booking.bookingStatus = "cancelled";
		await booking.save();

		await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_URL}/emit`, {
			event: "cancel-booking",
			userId: booking.driver,
			data: booking._id,
		});

		return NextResponse.json(
			{ message: "booking cancelled" },
			{ status: 200 },
		);
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{
				message: "server error: cancel booking failed",
			},
			{ status: 500 },
		);
	}
}
