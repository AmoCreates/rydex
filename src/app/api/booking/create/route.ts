import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Booking from "@/model/booking.mode";
import User from "@/model/user.model";
import Vehicle from "@/model/vehicle.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		await dbConnect();

		const session = await auth();

		if (!session || !session.user?.email || session.user.role !== "customer") {
			return NextResponse.json(
				{ message: "unauthorized, please log in to book ride" },
				{ status: 401 },
			);
		}

		const {
			driverId,
			vehicleId,
			pickUpAddress,
			dropAddress,
			pickUpLocation,
			dropLocation,
			fare,
			customerName,
			customerMobile,
			distance,
		} = await req.json();

		if (!driverId || !vehicleId) {
			return NextResponse.json(
				{ message: "please select an vehicle to book a ride" },
				{ status: 400 },
			);
		}

		if (!pickUpAddress || !dropAddress) {
			return NextResponse.json(
				{
					message:
						"please select pickup and drop location to book a ride",
				},
				{ status: 400 },
			);
		}

		if (!pickUpLocation?.coordinates || !dropLocation?.coordinates) {
			return NextResponse.json(
				{ message: "please select the suggested pickup and drop addresses only" },
				{ status: 400 },
			);
		}

		if (!customerName || !customerMobile) {
			return NextResponse.json(
				{ message: "please add mobile number before book a ride" },
				{ status: 400 },
			);
		}

		const driver = await User.findById(driverId);
		if (!driver) {
			return NextResponse.json(
				{
					message:
						"Sorry!, driver not found, try to select any other vehicle",
				},
				{ status: 400 },
			);
		}

		const vehicle = await Vehicle.findById(vehicleId);
		if (!vehicle) {
			return NextResponse.json(
				{ message: "Selected vehicle not found" },
				{ status: 400 },
			);
		}

		const customerBooking = await Booking.findOne({
			customer: session.user.id,
			bookingStatus: {
				$in: ["requested", "awaiting payment", "confirmed", "started"],
			},
		});

		if (customerBooking) {
			return NextResponse.json(
				{
					message:
						"Sorry, you can't book any ride until you finished the current booked ride.",
				},
				{ status: 400 },
			);
		}

		const booking = await Booking.create({
			customer: session.user.id,
			driver: driver._id,
			vehicle: vehicleId,
			pickUpAddress,
			dropAddress,

			pickUpLocation,
			dropLocation,

			distance,
			fare,

			customerMobile,
			customerName,
			driverMobile: driver.mobile,

			bookingStatus: "requested",
		});

		return NextResponse.json(booking, { status: 201 });
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{
				message: "booking error",
			},
			{ status: 500 },
		);
	}
}
