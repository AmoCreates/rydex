import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Booking from "@/model/booking.model";
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
      session.user.role !== "partner"
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

    const booking = await Booking.findById(id);
    if (!booking || booking.paymentStatus !== "requested" || booking.paymentMode !== "cash" || booking.bookingStatus !== "awaiting payment" ) {
      return NextResponse.json(
        {
          message:
            "Sorry, No active cash requested bookings found",
        },
        { status: 400 },
      );
    }

    booking.paymentStatus = "pending";
    booking.paymentMode = "cash";
    booking.bookingStatus = "awaiting payment"
    await booking.save();

    return NextResponse.json(
      { success: true, message: "declined cash confirmation" },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "cash confirmation error",
      },
      { status: 500 },
    );
  }
}