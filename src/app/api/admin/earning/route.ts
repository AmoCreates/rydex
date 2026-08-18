import { auth } from "@/auth";
import Booking from "@/model/booking.model";
import User from "@/model/user.model";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const session = await auth();
		if (!session || !session.user?.email || session.user.role !== "admin") {
			return Response.json({ message: "unauthorized" }, { status: 401 });
		}


		const admin = await User.findOne({ email: session.user.email });
		if (!admin) {
			return Response.json({ message: "Not an admin" }, { status: 401 });
		}

		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

		const bookings = await Booking.find({
			paymentStatus: "paid",
			createdAt: { $gte: sevenDaysAgo },
		}).select("adminCommission createdAt");

		const earningMap: Record<string, number> = {};

		bookings.forEach((b) => {
			const date = new Date(b.createdAt).toLocaleDateString("en-IN", {
				day: "2-digit",
				month: "short",
			});

			if (!earningMap[date]) {
				earningMap[date] = 0;
			}

			earningMap[date] = earningMap[date] + b.adminCommission || 0;
		});

		const earnings = Object.entries(earningMap).map(([date, earnings]) => ({
			date,
			earnings,
		}));

		return NextResponse.json(earnings, {
			status: 200,
		});
	} catch  {
		return NextResponse.json(
			{ message: "server error: failed to fetch Admin earning" },
			{ status: 500 },
		);
	}
}
