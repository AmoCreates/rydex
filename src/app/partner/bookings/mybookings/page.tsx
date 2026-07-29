"use client";
import axios from "axios";
import {
	Bike,
	Bus,
	Calendar,
	Car,
	Check,
	CircleDashed,
	Clock4,
	IndianRupee,
	MapPin,
	Package,
	Phone,
	Truck,
	User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { IUser } from "@/model/user.model";
import { IVehicle } from "@/model/vehicle.model";
import { BookingStatus, PaymentStatus } from "@/model/booking.model";
import { RiCheckDoubleLine, RiSendPlaneFill } from "@remixicon/react";

export interface IBooking {
	customer: IUser;
	driver: IUser;
	vehicle: IVehicle;

	pickUpAddress: string;
	dropAddress: string;

	pickUpLocation: {
		type: "Point";
		coordinates: [number, number];
	};
	dropLocation: {
		type: "Point";
		coordinates: [number, number];
	};

	distance: number;

	fare: number;

	customerMobile: string;
	customerName: string;
	driverMobile: string;

	bookingStatus: BookingStatus;
	paymentStatus: PaymentStatus;

	paymentMode: "cash" | "online";
	paymentDeadline: Date;

	adminCommission: number;
	partnerAmount: number;

	pikcUpOtp: string;
	pickUpOtpExpires: Date;
	dropOtp: string;
	dropOtpExpires: Date;

	createdAt?: Date;
	updatedAt?: Date;
}

const getStatusStyles = (status: string) => {
	const normalizedStatus = status?.toLowerCase() || "";

	switch (normalizedStatus) {
		case "requested":
			return "bg-amber-100 text-amber-700 border-amber-200";
		case "awaiting pickup":
			return "bg-sky-100 text-sky-700 border-sky-200";
		case "started":
			return "bg-blue-100 text-blue-700 border-blue-200";
		case "completed":
			return "bg-emerald-100 text-emerald-700 border-emerald-200";
		case "awaiting payment":
			return "bg-violet-100 text-violet-700 border-violet-200";
		case "confirmed":
			return "bg-green-100 text-green-700 border-green-200";
		case "cancelled":
			return "bg-rose-100 text-rose-700 border-rose-200";
		case "rejected":
			return "bg-red-100 text-red-700 border-red-200";
		case "expired":
			return "bg-gray-100 text-gray-700 border-gray-200";
		default:
			return "bg-slate-100 text-slate-700 border-slate-200";
	}
};

const formatStatusText = (status: string) => {
	return (status || "")
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
};

const getIcon = (vehicleType?: string) => {
	switch (vehicleType?.toLocaleLowerCase()) {
		case "bike":
			return <Bike className="w-4 h-4 text-gray-400" />;
		case "auto":
			return <Car className="w-4 h-4 text-gray-400" />;
		case "car":
			return <Car className="w-4 h-4 text-gray-400" />;
		case "truck":
			return <Truck className="w-4 h-4 text-gray-400" />;
		case "bus":
			return <Bus className="w-4 h-4 text-gray-400" />;
		case "loading":
			return <Package className="w-4 h-4 text-gray-400" />;
		default:
			return <Car className="w-4 h-4 text-gray-400" />;
	}
};

const Page = () => {
	const [bookings, setBookings] = useState<IBooking[]>([]);
	const [selectStatus, setSelectStatus] = useState("All");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const getActiveRides = async () => {
			try {
				setLoading(true);
				const { data } = await axios.get(
					"/api/partner/bookings/mybookings",
				);
				console.log(data.bookings);
				if (data.success) {
					setBookings(data.bookings);
				}
			} catch (error) {
				if (axios.isAxiosError(error)) {
					console.log(error.response?.data?.message);
				} else {
					console.log(error);
				}
			} finally {
				setLoading(false);
			}
		};

		getActiveRides();
	}, []);

	const filterBookings: IBooking[] =
		selectStatus === "All"
			? bookings
			: bookings.filter(
					(b) => b.bookingStatus === selectStatus.toLowerCase(),
				);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date
			.toLocaleDateString("en-US", {
				day: "numeric",
				month: "short",
				hour: "2-digit",
				minute: "2-digit",
			})
			.replace(",", "");
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="max-w-3xl mx-auto py-6">
						<div className="flex items-center gap-3">
							<div className="bg-blue-100 p-2 rounded-lg">
								<Car className="w-5 h-5 text-blue-600" />
							</div>
							<div>
								<h1 className="text-2xl font-semibold text-gray-900">
									Partner Bookings
									<p className="text-gray-500 text-sm mt-1">
										{bookings.length}{" "}
										{bookings.length === 1
											? "ride"
											: "rides"}{" "}
										assigned to you
									</p>
								</h1>
							</div>
						</div>
					</div>
				</div>
			</header>

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
				<div className="max-w-3xl mx-auto">
					<div className="flex justify-between gap-2 items-center mb-6">
						<div className="text-sm text-gray-500">
							Showing {filterBookings.length} bookings
						</div>
						<select
							value={selectStatus}
							onChange={(e) => setSelectStatus(e.target.value)}
							className="bg-white border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
						>
							<option>All</option>
							<option>Requested</option>
							<option>Awaiting Pickup</option>
							<option>Started</option>
							<option>Awaiting Payment</option>
							<option>Confirmed</option>
							<option>Cancelled</option>
							<option>Rejected</option>
							<option>Expired</option>
						</select>
					</div>

					{loading && (
						<div className="flex justify-center gap-2 items-center">
							<CircleDashed className="w-5 h-5 text-black animate-spin" />
							<span>Finding Bookings...</span>
						</div>
					)}

					{!loading && filterBookings.length === 0 && (
						<div className="bg-white rounded-2xl p-12 text-center shadow-sm">
							<Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
							<h1 className="text-lg font-medium text-gray-900">
								No bookings yet.
							</h1>
							<p className="text-gray-500 text-sm mt-1">
								When customer book rides, they{"'"}ll appear
								here
							</p>
						</div>
					)}

					{!loading && filterBookings.length > 0 && (
						<div>
							{filterBookings.map((b, i) => (
								<div key={i}>
									<motion.div
										key={i}
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: i * 0.05 }}
									>
										<div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden mb-4">
											{/* CUSTOMER DATA */}
											<div className="flex items-center gap-3 p-4 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-gray-50">
												<div className="w-12 h-12 rounded-full overflow-hidden bg-blue-200 shrink-0 border-2 border-white shadow-sm flex items-center justify-center">
													<User className="w-6 h-6 text-blue-600" />
												</div>
												<div className="flex-1">
													<div className="flex items-center justify-between">
														<h3 className="font-semibold text-gray-900">
															{b.customerName.toUpperCase() ||
																"Customer"}
														</h3>
														<span
															className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium capitalize ${getStatusStyles(b.bookingStatus)}`}
														>
															{formatStatusText(
																b.bookingStatus,
															)}
														</span>
													</div>
													<div className="flex items-center  gap-1 mt-1 text-xs text-gray-600">
														<Phone className="w-3 h-3" />
														{b.customerMobile}
													</div>
												</div>
											</div>

											{/* VEHICLE DATA */}
											<div className="px-4 pt-3">
												<div className="bg-gray-50 rounded-lg p-2 flex items-center gap-2">
													{getIcon(b.vehicle.type)}
													<div className="text-xs text-gray-600">
														{b.vehicle.vehicleModel}{" "}
														•{" "}
														{b.vehicle
															.vehicleNumber ||
															"Not assigned"}
													</div>
												</div>
											</div>

											{/* PICKUP & DROP  */}
											<div className="p-4 space-y-3">
												{/* PICKUP */}
												<div className="flex items-start gap-3">
													<div className="shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
														<MapPin className="w-3 h-3 text-green-600" />
													</div>
													<div className="flex-1">
														<span className="text-xs font-medium text-green-600 uppercase tracking-wider">
															PICK UP
														</span>
														<p className="text-sm text-gray-700 mt-0.5 leading-relaxed">
															{b.pickUpAddress}
														</p>
													</div>
												</div>

												{/* DROP */}
												<div className="flex items-start gap-3">
													<div className="shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
														<RiSendPlaneFill className="w-3 h-3 text-red-600" />
													</div>
													<div className="flex-1">
														<span className="text-xs font-medium text-red-600 uppercase tracking-wider">
															DROP
														</span>
														<p className="text-sm text-gray-700 mt-0.5 leading-relaxed">
															{b.dropAddress}
														</p>
													</div>
												</div>
											</div>

											{/* PRICE AND TIMING */}
											<div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
												{/* TIMING */}
												<div className="flex items-center gap-2 text-sm text-gray-600">
													<Calendar className="w-4 h-4 text-gray-400" />
													<span>
														{formatDate(
															b.createdAt!.toString()!,
														)}
													</span>
												</div>

												{/* PRICING */}
												<div className="flex items-center gap-1 font-semibold text-gray-900">
													<IndianRupee className="w-4 h-4" />
													{b.fare}
												</div>
											</div>

											{/* PAYMENT-STATUS */}
											<div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 capitalize">
												<div className="flex items-center gap-2">
													<span className="text-xs text-gray-500">
														Payment
													</span>
													<span
														className={`text-xs px-2 py-1 rounded-full ${b.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"} flex items-center gap-1`}
													>
														{b.paymentStatus ===
														"paid" ? (
															<RiCheckDoubleLine
																size={12}
															/>
														) : (
															<Clock4 size={12} />
														)}
														{b.paymentStatus}
													</span>
												</div>
											</div>
										</div>
									</motion.div>
								</div>
							))}
						</div>
					)}
				</div>
			</main>
		</div>
	);
};

export default Page;
