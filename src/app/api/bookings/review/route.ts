import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Booking from "@/model/booking.model";
import Vehicle from "@/model/vehicle.model";
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

		const { id, review } = await req.json();

		if (!id) {
			return NextResponse.json(
				{ message: "missing id!, can't find any booking" },
				{ status: 400 },
			);
		}

		if (!review) {
			return NextResponse.json(
				{ message: "didn't receive reviews" },
				{ status: 400 },
			);
		}

		const booking = await Booking.findById(id).populate([
			{ path: "vehicle", model: Vehicle },
		]);

		const allowedStatuses = ["completed"];

		if (!booking || !allowedStatuses.includes(booking.bookingStatus)) {
			return NextResponse.json(
				{
					message: "Sorry, we couldn't find any completed booking",
				},
				{ status: 404 },
			);
		}

		// Check if booking has already been reviewed
		if (booking.reviewed && booking.reviewed > 0) {
			return NextResponse.json(
				{ message: "Booking has already been reviewed" },
				{ status: 400 },
			);
		}

		const currentRating = booking.vehicle.rating || 0;
		const currentCount = booking.vehicle.reviews || 0;

		// Calculate exact new average
		const newCount = currentCount + 1;
		const newRating = (currentRating * currentCount + review) / newCount;

		// Store updated values
		booking.vehicle.rating = Number(newRating.toFixed(2)); // Round to 2 decimal places if needed
		booking.vehicle.reviews = newCount;
		booking.reviewed = review;
		await booking.save();
		await booking.vehicle.save();

		return NextResponse.json(
			{ message: "thanks for review" },
			{ status: 200 },
		);
	} catch {
		return NextResponse.json(
			{
				message: "server error: review error",
			},
			{ status: 500 },
		);
	}
}
