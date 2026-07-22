import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import razorpay from "@/lib/razorpay";
import Booking from "@/model/booking.mode";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
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

		const { bookingId, amount } = await req.json();

		if (!amount) {
			return NextResponse.json(
				{
					success: false,
					message: "Amount required",
				},
				{ status: 401 },
			);
		}

		const booking = await Booking.findById(bookingId);
		if (!booking) {
			return NextResponse.json(
				{
					success: false,
					message: "No booking found",
				},
				{ status: 401 },
			);
		}

		const options = {
			amount: Number(booking.fare) * 100,
			currency: "INR",
			receipt: bookingId.toString(),
		};
		const order = await razorpay!.orders.create(options);

		return NextResponse.json(
			{ success: true, orderId: order.id, amount: order.amount, currency: order.currency },
			{ status: 200 },
		);
	} catch (error) {
		console.log("Checkout Failed Error: ", error);
		return NextResponse.json(
			{
				success: false,
				message: "Checkout Failed Error",
			},
			{ status: 500 },
		);
	}
}
