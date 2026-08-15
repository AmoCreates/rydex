import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Booking from "@/model/booking.model";
import User from "@/model/user.model";
import { NextResponse } from "next/server";

export async function POST() {
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
			bookingStatus: "awaiting payment",
			paymentMode: "cash",
			paymentStatus: "requested",
		});

		if (!booking) {
			return NextResponse.json(
				{ success: false, message: "no cash request found" },
				{ status: 400 },
			);
		}

		const adminCommission = Number(booking.fare * 0.1);
		const partnerAmount = Number(booking.fare - adminCommission);

		booking.bookingStatus = "completed";
		booking.paymentStatus = "paid";
		booking.adminCommission = adminCommission;
		booking.partnerAmount = partnerAmount;
		booking.paymentMode = "cash";
		await booking.save();

		return NextResponse.json(
			{
				success: true,
				adminCommission,
				partnerAmount,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{
				success: false,
				message: "accecpt cash failed, please try again",
			},
			{ status: 500 },
		);
	}
}

export async function GET() {
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
			bookingStatus: "awaiting payment",
			paymentMode: "cash",
			paymentStatus: "requested",
		});

		if (!booking) {
			return NextResponse.json(
				{ success: false, message: "no cash request found" },
				{ status: 200 },
			);
		}

		return NextResponse.json({ success: true, booking }, { status: 200 });
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ success: false, message: "fetching cash request failed" },
			{ status: 500 },
		);
	}
}
