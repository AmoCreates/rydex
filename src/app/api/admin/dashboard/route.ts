import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/model/user.model";
import Vehicle from "@/model/vehicle.model";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		await dbConnect();

		const session = await auth();
		if (!session || !session.user?.email || session.user.role !== "admin") {
			return Response.json({ message: "unauthorized" }, { status: 401 });
		}

		const admin = await User.findOne({ email: session.user.email });
		if (!admin) {
			return Response.json({ message: "Not an admin" }, { status: 401 });
		}

		const totalPartners = await User.countDocuments({ role: "partner" });
		const totalRejectedPartners = await User.countDocuments({
			role: "partner",
			partnerStatus: "rejected",
		});
		const totalApprovedPartners = await User.countDocuments({
			role: "partner",
			partnerStatus: "approved",
		});

		const totalPendingDocsReview = await User.countDocuments({
			role: "partner",
			partnerStatus: "pending",
			partnerOnBoardingStep: 3,
		});

		const totalPendingVideoKyc = await User.countDocuments({
			role: "partner",
			partnerStatus: "pending",
			partnerOnBoardingStep: 4,
		});

		const totalPendingFinalReview = await User.countDocuments({
			role: "partner",
			partnerStatus: "pending",
			partnerOnBoardingStep: 6,
		});

		const totalPendingPartners =
			totalPendingDocsReview +
			totalPendingVideoKyc +
			totalPendingFinalReview;

		const pendingPartnerReviews = await User.find({
			role: "partner",
			partnerStatus: "pending",
			partnerOnBoardingStep: 3,
		});

		const pendingVideoKyc = await User.find({
			role: "partner",
			partnerStatus: "pending",
			partnerOnBoardingStep: 4,
			videoKycStatus: { $in: ["pending", "in progress"] },
		});

		const pendingVehicle = await User.find({
			role: "partner",
			partnerStatus: "pending",
			partnerOnBoardingStep: 6,
		});

		const partnerPricingReview = pendingVehicle.map(
			(partner) => partner._id,
		);
		const pendingPricing = await Vehicle.find({
			owner: { $in: partnerPricingReview },
			status: "pending"

		}).populate("owner");

		return NextResponse.json(
			{
				stats: {
					totalPartners,
					totalPendingPartners,
					totalRejectedPartners,
					totalApprovedPartners,
					totalPendingVideoKyc,
					totalPendingFinalReview,
				},
				pendingVideoKyc,
				pendingPricing,
				pendingPartnerReviews,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.log(error);
		return NextResponse.json(
			{ message: "Admin Dashboard error", error },
			{ status: 500 },
		);
	}
}
