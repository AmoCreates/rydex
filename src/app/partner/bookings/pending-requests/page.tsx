"use client";
import { IBooking } from "@/model/booking.mode";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CircleDashed, Clock4, IndianRupee, MapPin } from "lucide-react";
import { RiSendPlaneFill } from "@remixicon/react";

const Page = () => {
	const [bookings, setBookings] = useState<IBooking[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchPendingRequest = async () => {
			try {
				setLoading(true);
				const { data } = await axios.get(
					"/api/partner/bookings/pending-requests",
				);
				console.log(data);
				setBookings(data);
			} catch (error: any) {
				const axiosError = error;
				const serverMessage = axiosError?.response?.data?.message;
				console.log(
					"count pending request error",
					serverMessage ||
						axiosError?.response?.data ||
						axiosError?.message ||
						axiosError,
				);
			} finally {
				setLoading(false);
			}
		};
		fetchPendingRequest();
	}, []);

	return (
		<div className="min-h-screen bg-[#f4f5f7]">
			<div className="bg-white border-b border-gray-200">
				<div className="max-w-6xl mx-auto px-6 py-16">
					<h1 className="text-4xl font-semibold text-gray-900">
						Ride Request
					</h1>
					<p className="mt-3 text-gray-500 text-lg">
						Manage incoming ride request and respond in real time.
					</p>
				</div>
			</div>

			<div className="max-w-6xl mx-auto px-6 py-12">
				{loading ? (
					<div className="flex justify-center gap-2 items-center">
						<CircleDashed className="w-5 h-5 text-black animate-spin" />
						<span>Finding Requests...</span>
					</div>
				) : bookings.length === 0 ? (
					<div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
						<p className="text-gray-500 text-lg">
							No pending ride requests.
						</p>
					</div>
				) : (
					<div className="space-y-6">
						{bookings.map((b, i) => (
							<motion.div
								key={i}
								initial={{ opacity: 0, y: 15 }}
								animate={{ opacity: 1, y: 0 }}
								whileHover={{ y: -2 }}
								transition={{ duration: 0.25 }}
								className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition"
							>
								<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
									{/* Left: Pickup & Drop Address & Time*/}
									<div className="flex-1 space-y-6">
										{/* Pickup Address */}
										<div className="flex gap-4">
											<div className="bg-gray-100 p-3 rounded-lg flex items-center justify-center">
												<MapPin size={18} />
											</div>
											<div>
												<p className="text-xs uppercase text-gray-400 mb-1">
													Pickup Location
												</p>
												<p className="text-gray-900 font-medium">
													{b.pickUpAddress}
												</p>
											</div>
										</div>

										{/* Drop Address */}
										<div className="flex gap-4">
											<div className="bg-gray-100 p-3 rounded-lg flex items-center justify-center">
												<RiSendPlaneFill size={18} />
											</div>
											<div>
												<p className="text-xs uppercase text-gray-400 mb-1">
													Drop Location
												</p>
												<p className="text-gray-900 font-medium">
													{b.dropAddress}
												</p>
											</div>
										</div>

										{/* Time */}
										<div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
											<Clock4
												size={14}
												className="opacity-70"
											/>
											<span className="font-medium">
												{new Date(
													b.createdAt!,
												).toLocaleString("en-IN", {
													day: "2-digit",
													month: "short",
													year: "numeric",
													hour: "2-digit",
													minute: "2-digit",
												})}
											</span>
										</div>
									</div>

									{/* Right */}
									<div className="flex flex-col justify-between lg:items-end gap-6 w-full lg:w-auto">
										{/* Fare */}
										<div className="text-left lg:text-right">
											<p className="text-xs tracking-wide text-gray-400 uppercase mb-1">
												Estimated Fare
											</p>
											<div className="flex items-center gap-1 text-3xl font-bold text-gray-900 lg:justify-end">
												<IndianRupee size={20} />
												{b.fare}
											</div>
										</div>

										<div className="flex gap-4 w-full lg:w-auto">
											<button className="px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-100 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer">
												Reject Ride
											</button>
											<button className="flex items-center justify-center flex-1 lg:flex-none px-8 py-3 rounded-xl bg-black text-white text-sm font-semibold shadow-md hover:bg-gray-900 hover:shadow-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer">
												Accept Ride
											</button>
										</div>
									</div>
								</div>
							</motion.div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default Page;
