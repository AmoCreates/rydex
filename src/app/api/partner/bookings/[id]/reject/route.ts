import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Booking from "@/model/booking.model";
import User from "@/model/user.model";
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
			session.user?.role !== "partner"
		) {
			return NextResponse.json(
				{ message: "unauthorized, please log in" },
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

		const partner = await User.findOne({ email: session.user.email });
		if (!partner) {
			return NextResponse.json(
				{ message: "please login again" },
				{ status: 401 },
			);
		}

		const booking = await Booking.findById(id);

		if (!booking || booking.bookingStatus !== "requested") {
			return NextResponse.json(
				{
					message:
						"invalid request!, the customer might have cancelled the request a just a moment ago.",
				},
				{ status: 401 },
			);
		}

		booking.bookingStatus = "rejected";
		booking.paymentStatus = "idle";
		await booking.save();

		await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_URL}/emit`, {
			event: "reject-booking",
			userId: booking.customer,
			data: booking.bookingStatus,
		});

		return NextResponse.json({ success: true }, { status: 200 });
	} catch {
		return NextResponse.json(
			{ message: "server error: failed to reject booking" },
			{ status: 500 },
		);
	}
}
