import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Booking from "@/model/booking.model";
import Chat from "@/model/chat.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		await dbConnect();

		const session = await auth();

		if (!session || !session.user?.email || session.user.role === "admin") {
			return NextResponse.json(
				{ message: "unauthorized, please log in to book ride" },
				{ status: 401 },
			);
		}

		const { bookingId } = await req.json();

		const booking = await Booking.findById(bookingId);
		if (!booking) {
			return NextResponse.json(
				{
					message: "Sorry!, we couldn't find any active ride",
				},
				{ status: 400 },
			);
		}

		const chat = await Chat.find({ bookingId }).sort({ createdAt: 1 });

		return NextResponse.json(chat, { status: 200 });
	} catch  {
		return NextResponse.json(
			{
				message: "server error: failed to load chat messages",
			},
			{ status: 500 },
		);
	}
}
