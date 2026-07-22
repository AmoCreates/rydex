import dbConnect from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Booking from "@/model/booking.mode";
import razorpay from "@/lib/razorpay";

export async function POST(req: NextRequest) {
	try {
		dbConnect();

		const {
			bookingId,
			razorpay_order_id,
			razorpay_payment_id,
			razorpay_signature,
		} = await req.json();

		if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
			return NextResponse.json(
				{
					success: false,
					message: "Missing payment details",
				},
				{ status: 400 },
			);
		}

		const body = razorpay_order_id + "|" + razorpay_payment_id;
		const expectedSignature = crypto
			.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
			.update(body)
			.digest("hex");

		if (expectedSignature !== razorpay_signature) {
			return NextResponse.json(
				{
					success: false,
					message: "Invalid signature - Payment verification failed",
				},
				{ status: 400 },
			);
		}

		const booking = await Booking.findById(bookingId);
		if (!booking || booking.length == 0) {
			return NextResponse.json(
				{
					success: false,
					message: "No booking found",
				},
			);
		}

		const adminCommission = Number(booking.fare * 0.1);
		const partnerAmount = Number(booking.fare - adminCommission);

		booking.bookingStatus = "confirmed";
		booking.paymentStatus = "paid";
		booking.adminCommission = adminCommission;
		booking.partnerAmount = partnerAmount;
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
				message: `payment verifcation faild err, ${error}`,
			},
			{ status: 500 },
		);
	}
}
