import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Booking from "@/model/booking.mode";
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
				{ message: "unauthorized, please log in to payment" },
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

		const allowedStatuses = ["awaiting payment"];

		// if (!booking || !allowedStatuses.includes(booking.bookingStatus)) {
		// 	return NextResponse.json(
		// 		{
		// 			message:
		// 				"Sorry, we can't allowed you to pay before ride completed",
		// 		},
		// 		{ status: 400 },
		// 	);
		// }

		booking.paymentStatus = "pending";
		booking.paymentMode = "cash";
		await booking.save();

		return NextResponse.json(
			{ message: "waiting for partner confirmation" },
			{ status: 200 },
		);
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{
				message: "cash selection error",
			},
			{ status: 500 },
		);
	}
}

