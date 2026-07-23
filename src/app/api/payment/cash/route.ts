import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Booking from "@/model/booking.mode";
import User from "@/model/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	try {
		await dbConnect();

		const session = await auth();
		if (!session || !session.user?.email) {
			return NextResponse.json(
				{ message: "unauthorized, please log in" },
				{ status: 401 },
			);
		}

		const partner = await User.findById(session.user.id);
		if (!partner) {
			return NextResponse.json({
				message: "unauthorize!, please login to continue",
			});
		}

		const booking = await Booking.findOne({
			driver: partner._id,
		});

		if (
			booking.length !== 0 &&
			booking.bookingStatus === "awaiting payment" &&
			booking.paymentMode === "cash" &&
			booking.paymentStatus === "pending" &&
			booking.isCashReceived === false
		) {
			return NextResponse.json({ success: true, booking }, { status: 200 });
		}

		return NextResponse.json({ message: "no cash payment requested" });
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ success: false, message: "cash request fetch failed" },
			{ status: 500 },
		);
	}
}
