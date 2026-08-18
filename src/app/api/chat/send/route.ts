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

		const { bookingId, sender, msg } = await req.json();

		const booking = await Booking.findById(bookingId);
		if (!booking) {
			return NextResponse.json(
				{
					message: "Sorry!, we couldn't find any active ride",
				},
				{ status: 400 },
			);
		}

		const chat = await Chat.create({
			bookingId,
			sender,
			msg,
		});

		return NextResponse.json(
			{ chat, message: "message sent successfully" },
			{ status: 200 },
		);
	} catch  {;
		return NextResponse.json(
			{
				message: "server error: failed to send message",
			},
			{ status: 500 },
		);
	}
}
