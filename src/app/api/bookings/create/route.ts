import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Booking from "@/model/booking.model";
import User from "@/model/user.model";
import Vehicle from "@/model/vehicle.model";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		await dbConnect();

		const session = await auth();
		const customerId = session?.user?.id ? String(session.user.id) : null;

		if (!session || !session.user?.email || !customerId || session.user.role !== "customer") {
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
				{success: false, message: "please add mobile number before book a ride" },
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

		if(driver.activeRide) {
			return NextResponse.json(
				{ message: "This vehicle already have a booked ride" },
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
			customer: customerId,
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

		// Check if there's an idle or cancelled booking to update
		const existingBooking = await Booking.findOne({
			customer: customerId,
			bookingStatus: {
				$in: ["idle"],
			},
		});

		let booking;

		if (existingBooking) {
			// Update existing booking
			booking = await Booking.findByIdAndUpdate(
				existingBooking._id,
				{
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
					paymentStatus: "pending",
				},
				{ new: true }
			);
		} else {
			// Create new booking if no idle booking exists
			booking = await Booking.create({
				customer: customerId,
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
		}

		await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_URL}/emit`, {
			event:"new-booking",
			userId:driverId,
			data:booking
		})

		return NextResponse.json(booking, { status: 201 });
	} catch {
		return NextResponse.json(
			{
				message: "server error: failed to create booking",
			},
			{ status: 500 },
		);
	}
}
