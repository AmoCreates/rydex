"use client";
import { IBooking } from "@/model/booking.mode";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
	ArrowLeft,
	CircleDashed,
	Clock4,
	IndianRupee,
	MapPin,
	Phone,
	UserRound,
	X,
} from "lucide-react";
import { RiSendPlaneFill } from "@remixicon/react";
import { useRouter } from "next/navigation";

type ConfirmationModalType = null | "accept" | "reject";

const Page = () => {
	const [bookings, setBookings] = useState<IBooking[]>([]);
	const [loading, setLoading] = useState(false);
	const [confirm, setConfirm] = useState(false);
	const [confirmationModal, setConfirmationModal] =
		useState<ConfirmationModalType>(null);
	const [currBooking, setCurrBooking] = useState<IBooking | null>(null);
	const router = useRouter();

	useEffect(() => {
		const fetchPendingRequest = async () => {
			try {
				setLoading(true);
				const { data } = await axios.get(
					"/api/partner/bookings/pending-requests",
				);
				console.log(data);
				setBookings(data);
			} catch (error: unknown) {
				const axiosError = error as {
					response?: {
						data?: {
							message?: string;
						};
					};
					message?: string;
				};
				const serverMessage = axiosError?.response?.data?.message;
				console.log(
					"count pending request error",
					serverMessage ||
						axiosError?.response?.data ||
						axiosError?.message ||
						error,
				);
			} finally {
				setLoading(false);
			}
		};
		fetchPendingRequest();
	}, []);

	const handleAccept = async (id: string) => {
		try {
			setConfirm(true);
			const res = await axios.post(`/api/partner/bookings/${id}/accept`);
			if (res.status === 200) {
				console.log("ride accepted");
				router.push('/partner/bookings/active-ride')
			}
		} catch (error: unknown) {
			const axiosError = error as {
				response?: {
					data?: {
						message?: string;
					};
				};
				message?: string;
			};
			const serverMessage = axiosError?.response?.data?.message;
			console.log(
				"count pending request error",
				serverMessage ||
					axiosError?.response?.data ||
					axiosError?.message ||
					error,
			);
		} finally {
			setConfirm(false);
			setConfirmationModal(null);
		}
	};

	const handleReject = async (id: string) => {
		try {
			setConfirm(true);
			const res = await axios.post(`/api/partner/bookings/${id}/reject`);
			if (res.status === 200) {
				console.log("ride rejected");
				window.location.reload();
			}
		} catch (error: unknown) {
			const axiosError = error as {
				response?: {
					data?: {
						message?: string;
					};
				};
				message?: string;
			};
			const serverMessage = axiosError?.response?.data?.message;
			console.log(
				"count pending request error",
				serverMessage ||
					axiosError?.response?.data ||
					axiosError?.message ||
					error,
			);
		} finally {
			setConfirm(false);
			setConfirmationModal(null);
		}
	};

	function handleConfirm(id: string) {
		if (confirmationModal === "accept") {
			handleAccept(id);
		} else if (confirmationModal === "reject") {
			handleReject(id);
		} else return;
	}

	return (
		<div className="min-h-screen bg-[#f4f5f7]">
			{/* Header */}
			<div className="bg-white border-b border-gray-200">
				<div className="max-w-6xl mx-auto px-6 py-16">
					<h1 className="text-4xl font-semibold text-gray-900">
						Ride Request
					</h1>
					<p className="mt-3 text-gray-500 text-lg">
						Manage incoming ride request and respond in real time.
					</p>
				</div>

				{/* Back Button */}
				<motion.button
					whileTap={{ scale: 0.88 }}
					onClick={() => router.back()}
					className="absolute left-5 top-5 w-11 h-11 rounded-full bg-white border border-zinc-200 shadow-md flex items-center justify-center hover:bg-zinc-50 transition-colors cursor-pointer"
				>
					<ArrowLeft />
				</motion.button>
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

										{/* Customer Name and Mobile */}
										<div className="flex flex-wrap gap-5 px-5 bg-gray-100 p-2 rounded-2xl">

											{/* Customer Name */}
											<div className="flex gap-4">
												<div className="bg-blue-100 p-3 rounded-lg flex items-center justify-center">
													<UserRound size={18} />
												</div>
												<div>
													<p className="text-xs uppercase text-gray-400 mb-1">
														Customer Name
													</p>
													<p className="text-gray-900 font-medium">
														{b.customerName}
													</p>
												</div>
											</div>

											{/* Customer Mobile */}
											<div className="flex gap-4">
												<div className="bg-blue-100 p-3 rounded-lg flex items-center justify-center">
													<Phone size={18} />
												</div>
												<div>
													<p className="text-xs uppercase text-gray-400 mb-1">
														Customer Mobile
													</p>
													<p className="text-gray-900 font-medium">
														{b.customerMobile}
													</p>
												</div>
											</div>
										</div>
										
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
											<button
												onClick={() => {
													setConfirmationModal(
														"reject",
													);
													setCurrBooking(b);
												}}
												className="px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-100 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer"
											>
												Reject Ride
											</button>
											<button
												onClick={() => {
													setConfirmationModal(
														"accept",
													);
													setCurrBooking(b);
												}}
												className="flex items-center justify-center flex-1 lg:flex-none px-8 py-3 rounded-xl bg-black text-white text-sm font-semibold shadow-md hover:bg-gray-900 hover:shadow-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer"
											>
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

			{/* Confirmation Modal */}
			<AnimatePresence>
				{confirmationModal && (
					<>
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
						/>

						{/* Modal */}
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							transition={{
								duration: 0.3,
								type: "tween",
								ease: "easeInOut",
							}}
							className="fixed inset-0 flex items-center justify-center z-50 p-4"
						>
							<div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm md:max-w-lg overflow-hidden">
								{/* Modal Header */}
								<div
									className={`px-6 py-4 border-b border-gray-200 ${
										confirmationModal === "accept"
											? "bg-linear-to-r from-black to-gray-800"
											: "bg-linear-to-r from-red-50 to-red-100"
									}`}
								>
									<div className="flex items-center justify-between">
										<h2
											className={`text-lg font-semibold ${
												confirmationModal === "accept"
													? "text-white"
													: "text-red-900"
											}`}
										>
											{confirmationModal === "accept"
												? "Accept Ride"
												: "Reject Ride"}
										</h2>
										<button
											onClick={() =>
												setConfirmationModal(null)
											}
											className={`p-1 rounded-lg cursor-pointer transition-colors ${
												confirmationModal === "accept"
													? "hover:bg-white/20 text-white"
													: "hover:bg-red-200 text-red-900"
											}`}
										>
											<X size={20} />
										</button>
									</div>
								</div>

								{/* Modal Body */}
								<div className="px-6 py-6">
									<>
										<p className="text-gray-600 text-sm mb-6">
											Are you sure you want to{" "}
											<span className="font-semibold">
												{confirmationModal === "accept"
													? "accept"
													: "reject"}
											</span>{" "}
											this ride request?
										</p>

										{/* Booking Summary */}
										<div className="bg-gray-50 rounded-lg p-4 space-y-3 mb-6">
											<div className="flex gap-2">
												<MapPin
													size={16}
													className="text-gray-500 shrink-0 mt-0.5"
												/>
												<div className="min-w-0">
													<p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
														From
													</p>
													<p className="text-sm font-medium text-gray-900 wrap-break-word">
														{
															currBooking?.pickUpAddress
														}
													</p>
												</div>
											</div>

											<div className="flex gap-2">
												<RiSendPlaneFill
													size={16}
													className="text-gray-500 shrink-0 mt-0.5"
												/>
												<div className="min-w-0">
													<p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
														To
													</p>
													<p className="text-sm font-medium text-gray-900 wrap-break-word">
														{
															currBooking?.dropAddress
														}
													</p>
												</div>
											</div>

											<div className="flex gap-2 pt-2 border-t border-gray-200">
												<IndianRupee
													size={16}
													className="text-gray-500 shrink-0 mt-0.5"
												/>
												<div>
													<p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
														Fare
													</p>
													<p className="text-sm font-bold text-gray-900">
														₹{currBooking?.fare}
													</p>
												</div>
											</div>
										</div>
									</>
								</div>

								{/* Modal Footer */}
								<div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
									<button
										onClick={() =>
											setConfirmationModal(null)
										}
										className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium cursor-pointer text-sm hover:bg-gray-100 transition-colors active:scale-[0.98]"
									>
										Cancel
									</button>
									<button
										onClick={() =>
											handleConfirm(
												currBooking!._id.toString(),
											)
										}
										className={`flex-1 px-4 py-2.5 rounded-lg cursor-pointer text-white font-medium text-sm transition-all active:scale-[0.98] ${
											confirmationModal === "accept"
												? "bg-black hover:bg-gray-900 shadow-md"
												: "bg-red-600 hover:bg-red-700 shadow-md"
										}`}
									>
										{confirmationModal === "accept"
											? confirm
												? "Accepting..."
												: "Accept Ride"
											: confirm
												? "Rejecting..."
												: "Confirm Reject"}
									</button>
								</div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</div>
	);
};

export default Page;
