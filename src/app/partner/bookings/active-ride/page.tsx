"use client";
import LiveRideMap from "@/components/LiveRideMap";
import axios from "axios";
import { ArrowRight, ChevronUp, CircleDashed, MapPin, Zap } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import PanleContent from "@/components/PanleContent";
import { IUser } from "@/model/user.model";
import { BookingStatus, PaymentStatus } from "@/model/booking.model";
import { getSocket } from "@/lib/socket";

export interface IBooking {
	_id: string;
	customer: IUser;
	driver: IUser;
	vehicle: string;

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

	pickUpOtp: string;
	pickUpOtpExpires: Date;
	dropOtp: string;
	dropOtpExpires: Date;

	createdAt?: Date;
	updatedAt?: Date;
}

const getStatusStyle = (status: string | undefined) => {
	const normalizedStatus = status?.toLowerCase() || "";

	switch (normalizedStatus) {
		case "idle":
			return {
				label: "No Booking",
				sublabel: "Check actively for booking",
				dot: "bg-blue-400",
			};
		case "requested":
			return {
				label: "Awaiting Confirmation",
				sublabel: "Booking is being processed",
				dot: "bg-amber-400",
			};
		case "awaiting pickup":
			return {
				label: "Heading to Pickup",
				sublabel: "Drive to the pickup location",
				dot: "bg-amber-400",
			};
		case "started":
			return {
				label: "Ride in Progress",
				sublabel: "Heding to drop location",
				dot: "bg-emerald-400",
			};
		case "completed":
			return {
				label: "Ride Completed",
				sublabel: "Trip has ended successfully",
				dot: "bg-zinc-400",
			};
		case "awaiting payment":
			return {
				label: "Payment Pending",
				sublabel: "Customer payment is pending",
				dot: "bg-purple-400",
			};
		case "confirmed":
			return {
				label: "Payment Done",
				sublabel: "Customer paid",
				dot: "bg-green-400",
			};
		case "cancelled":
			return {
				label: "Ride Cancelled",
				sublabel: "This ride was cancelled",
				dot: "bg-red-400",
			};
		case "rejected":
			return {
				label: "Ride Rejected",
				sublabel: "Booking was rejected",
				dot: "bg-red-400",
			};
		case "expired":
			return {
				label: "Ride Expired",
				sublabel: "Booking timed out",
				dot: "bg-orange-400",
			};
		default:
			return {
				label: "Unexpected",
				sublabel: "Try again",
				dot: "bg-slate-400",
			};
	}
};

const PAYMENT_BADGE: Record<PaymentStatus, { label: string; cls: string }> = {
	idle: { label: "N/A", cls: "bg-zinc-100 text-zinc-700" },
	pending: { label: "Pending", cls: "bg-amber-100 text-amber-700" },
	paid: { label: "Paid", cls: "bg-emerald-100 text-emerald-700" },
	failed: { label: "Failed", cls: "bg-red-100 text-red-700" },
};

const Page = () => {
	const [booking, setBooking] = useState<IBooking | null>(null);
	const [status, setStatus] = useState("awaiting pickup");
	const [loading, setLoading] = useState(false);
	const [driverPos, setDriverPos] = useState<[number, number] | null>(null);
	const [pickUpPos, setPickUpPos] = useState<[number, number] | null>(null);
	const [dropPos, setDropPos] = useState<[number, number] | null>(null);
	const [dstToPickUp, setDstToPickUp] = useState(0);
	const [dstToDrop, setDstToDrop] = useState(0);
	const [estPickUpTime, setEstPickUpTime] = useState(0);
	const [estDropTime, setEstDropTime] = useState(0);
	const [expanded, setExpanded] = useState(false);

	const [otpMode, setOtpMode] = useState(false);
	const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
	const otpInputsRef = useRef<Array<HTMLInputElement | null>>([]);
	const [loadingOtp, setLoadingOtp] = useState(false);
	const [otpErr, setOtpErr] = useState("");
	const [otpVerified, setOtpVerified] = useState(false);

	const clearOtpDigits = () => setOtpDigits(Array(6).fill(""));

	const sendPickupOtp = async () => {
		if (status !== "awaiting pickup" || otpVerified) return;
		try {
			console.log("sending");
			setLoadingOtp(true);
			clearOtpDigits();
			const { data } = await axios.post(
				"/api/partner/bookings/otp/pickup/send",
				{ bookingId: booking?._id },
			);
			if (data.success) {
				console.log(data);
				setOtpMode(true);
			}
		} catch (error) {
			console.log(error);
		} finally {
			setLoadingOtp(false);
		}
	};
	const sendDropOtp = async () => {
		if (status !== "started") return;
		try {
			console.log("sending");
			setLoadingOtp(true);
			clearOtpDigits();
			const { data } = await axios.post(
				"/api/partner/bookings/otp/drop/send",
				{ bookingId: booking?._id },
			);
			if (data.success) {
				console.log(data);
				setOtpMode(true);
			}
		} catch (error) {
			console.log(error);
		} finally {
			setLoadingOtp(false);
		}
	};
	const verifyPickupOtp = async () => {
		if (status !== "awaiting pickup" || !otpMode || otpVerified) return;
		const otp = otpDigits.join("");
		if (otp.length !== 6) {
			setOtpErr("Enter all 6 digits to verify the pickup otp.");
			return;
		}
		try {
			setLoadingOtp(true);
			setOtpErr("");
			const { data } = await axios.post(
				"/api/partner/bookings/otp/pickup/verify",
				{ bookingId: booking?._id, otp },
			);

			if (data.success) {
				setOtpVerified(true);
				setStatus("started");
				setBooking((prev) =>
					prev ? { ...prev, bookingStatus: "started" } : prev,
				);
				setOtpErr("Pickup verified. Ride started.");
			} else {
				setOtpErr(data.message || "Unable to verify the pickup OTP.");
			}
		} catch (error) {
			if (axios.isAxiosError(error)) {
				setOtpErr(
					error.response?.data?.message ||
						"Unable to verify the pickup OTP.",
				);
			} else {
				setOtpErr("Unable to verify the pickup OTP.");
			}
		} finally {
			setLoadingOtp(false);
		}
	};
	const verifyDropOtp = async () => {
		if (status !== "started" || !otpMode) return;
		const otp = otpDigits.join("");
		if (otp.length !== 6) {
			setOtpErr("Enter all 6 digits to verify the drop otp.");
			return;
		}
		try {
			setLoadingOtp(true);
			setOtpErr("");
			const { data } = await axios.post(
				"/api/partner/bookings/otp/drop/verify",
				{ bookingId: booking?._id, otp },
			);

			if (data.success) {
				setOtpVerified(true);
				setStatus("started");
				setBooking((prev) =>
					prev ? { ...prev, bookingStatus: "completed" } : prev,
				);
				setOtpErr("Pickup verified. Ride started.");
			} else {
				setOtpErr(data.message || "Unable to verify the pickup OTP.");
			}
		} catch (error) {
			if (axios.isAxiosError(error)) {
				setOtpErr(
					error.response?.data?.message ||
						"Unable to verify the drop OTP.",
				);
			} else {
				setOtpErr("Unable to verify the drop OTP.");
			}
		} finally {
			setLoadingOtp(false);
		}
	};

	function maskEmail(email: string | undefined) {
		return email!.replace(/(?<=^.{2}).+(?=.+@)/, "*****");
	}

	useEffect(() => {
		const getActiveRides = async () => {
			try {
				setLoading(true);
				const { data } = await axios.get(
					"/api/partner/bookings/active-ride",
				);
				console.log(data.booking);
				if (data.success) {
					setBooking(data.booking);
					setStatus(data.booking.bookingStatus);
					setPickUpPos(
						data.booking.pickUpLocation.coordinates.toReversed(),
					);
					setDropPos(
						data.booking.dropLocation.coordinates.toReversed(),
					);
					setOtpMode(data.booking?.pickUpOtp.length ? true : false);
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

	// Fetching Driver's Live Location
	useEffect(() => {
		const getCurrentLocation = async () => {
			if (!navigator.geolocation) {
				console.log("cant find navigator");
				return;
			}
			const socket = getSocket();
			const watcher = navigator.geolocation.watchPosition(
				({ coords }) => {
					const lon = coords.longitude;
					const lat = coords.latitude;
					setDriverPos([lat, lon]);
					socket?.emit("driver-location-update", {
						bookingId: booking?._id,
						status: status,
						latitude: lat,
						longitude: lon,
					});
				},
				(err) => {
					console.log(err);
				},
				{
					enableHighAccuracy: true,
					maximumAge: 2000,
					timeout: 10000,
				},
			);
			return () => {
				navigator.geolocation.clearWatch(watcher);
			};
		};

		getCurrentLocation();
	}, [booking?._id, status]);

	useEffect(() => {
		if (!booking?._id) return;
		const socket = getSocket();
		socket?.connect();
		socket?.emit("join-ride", booking?._id);
		const handler = ({
			latitude,
			longitude,
		}: {
			latitude: number;
			longitude: number;
		}) => {
			setDriverPos([latitude, longitude]);
		};

		socket?.on("driver-location", handler);

		return () => {
			socket?.off("driver-location", handler);
		};
	}, [booking?._id]);

	if (loading) {
		return (
			<div className="h-screen w-full bg-zinc-950 flex items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<CircleDashed className="w-8 h-8 text-gray-700 animate-spin" />
					<p className="text-white/40 text-sm tracking-widest uppercase font-medium">
						Loading Ride...
					</p>
				</div>
			</div>
		);
	}

	const cfg = getStatusStyle(booking?.bookingStatus ?? "confirmed");
	const isActive = ["awaiting pickup", "started"].includes(status);
	const paymentStatus = PAYMENT_BADGE[booking?.paymentStatus ?? "pending"];
	const displayTime =
		status === "awaiting pickup" ? estPickUpTime : estDropTime;
	const displayDistance =
		status === "awaiting pickup" ? dstToPickUp : dstToDrop;
	const panelProps = {
		isActive,
		displayDistance,
		displayTime,
		cfg,
		status,
		booking,
		paymentStatus,
		currRole: "driver",
	};

	return (
		<div className="h-screen w-full bg-zinc-100 flex flex-col lg:flex-row overflow-hidden">
			<div className="realtive flex-1 h-full z-0">
				<LiveRideMap
					driverLocation={driverPos}
					pickUpLocation={pickUpPos}
					dropLocation={dropPos}
					status={status}
					onStats={({
						dstToPickUp,
						dstToDrop,
						estPickUpTime,
						estDropTime,
					}) => {
						setDstToPickUp(dstToPickUp);
						setDstToDrop(dstToDrop);
						setEstPickUpTime(estPickUpTime);
						setEstDropTime(estDropTime);
					}}
				/>

				<motion.div
					initial={{ opacity: 0, y: -16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3, duration: 0.5 }}
					className="absolute top-4 left-1/2 -translate-x-1/2 z-500 pointer-events-none"
				>
					<div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-zinc-100">
						<span
							className={`w-2 h-2 rounded-full animate-pulse ${cfg.dot}`}
						/>
						<span className="text-xs font-semibold tracking-wide text-zinc-900">
							{cfg.label}
						</span>
					</div>
				</motion.div>
			</div>

			{/* Desktop View*/}
			<motion.div
				initial={{ x: 60, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
				className="hidden lg:flex w-[420px] lg:w-[460px] xl:w-[500px] bg-white border-l border-zinc-100 flex-col"
			>
				<div className="bg-zinc-950 px-6 py-5 shrink-0">
					<p className="text-zinc-500 text-[10px] tracking-[0.2em] uppercase font-semibold mb-1">
						Driver Panel
					</p>
					<div className="flex items-center justify-between">
						<h1 className="text-white text-xl font-bold">
							Active Ride
						</h1>
						{isActive && (
							<div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
								<Zap size={12} className="text-amber-400" />
								<span className="text-white text-xs font-semibold">
									{Math.round(displayTime)} min
								</span>
							</div>
						)}
					</div>
				</div>

				<div className="flex-1 flex-col overflow-hidden">
					<div className="flex-1 overflow-y-auto">
						<PanleContent {...panelProps} />
					</div>
				</div>
			</motion.div>

			<div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 pointer-events-none">
				<motion.div
					className="bg-white rounded-t-3xl shadow-2xl pointer-events-auto overflow-hidden flex flex-col"
					animate={{ height: expanded ? "82vh" : 142 }}
					transition={{ type: "spring", stiffness: 320, damping: 38 }}
				>
					<div
						className="shrink-0 cursor-pointer select-none"
						onClick={() => setExpanded(!expanded)}
					>
						<div className="pt-3 pb-1">
							<div
								className={`w-10 h-1 ${expanded ? "bg-black" : "bg-zinc-200"} rounded-full mx-auto`}
							/>
						</div>
					</div>

					<div className="px-5 py-3 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<span
								className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`}
							/>
							<div>
								<p className="text-sm font-bold text-zinc-900 leading-tight">
									{cfg.label}
								</p>
								<p className="text-xs text-zinc-400 leading-tight">
									{cfg.sublabel}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-3">
							{isActive && (
								<div className="text-right">
									<p className="text-2xl font-black text-zinc-900 leading-none">
										{Math.round(displayTime)}
									</p>
									<p className="text-[10px] text-zinc-400 uppercase tracking-wider">
										min
									</p>
								</div>
							)}
							<motion.div
								onClick={() => setExpanded(!expanded)}
								animate={{ rotate: expanded ? 180 : 0 }}
								transition={{ duration: 0.28 }}
								className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center"
							>
								<ChevronUp
									size={16}
									className="text-zinc-600"
								/>
							</motion.div>
						</div>
					</div>
					<div className="h-px bg-zinc-100 mx-5" />

					<div className="flex-1 overflow-y-auto min-h-0">
						<PanleContent {...panelProps} />
					</div>

					<div className="shrink-0 border-t border-zinc-100 bg-white px-5 py-4">
						<AnimatePresence mode="wait">
							{(status === "awaiting pickup" ||
								status === "started") &&
								!otpMode &&
								!otpVerified &&
								(
									<motion.button
										onClick={() => {
											console.log(status)
											if(status === "awaiting pickup") {
												sendPickupOtp()
											} else {
												sendDropOtp();
											}
										}}
										key={status === "awaiting pickup" ? "arrived" : "dropped"}
										initial={{ opacity: 0, y: 6 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -6 }}
										className={`w-full ${loadingOtp ? "bg-zinc-600" : "bg-zinc-900 hover:bg-zinc-800 active:scale-97 cursor-pointer"}  text-white py-4 rounded-xl font-bold text-sm tracking-wider transition-all flex items-center justify-center gap-2 disabled-cursor-not-allowed disabled-pointer-events-none`}
										disabled={loadingOtp}
									>
										<MapPin size={16} /> <p>{status === "awaiting pickup" ? "I've Arrived at Pickup" : "I've Dropped off the Customer"}</p>
										<ArrowRight
											size={15}
											className="ml-1"
										/>
									</motion.button>
								)}
						</AnimatePresence>

						{(status === "awaiting pickup" || status === "started") &&
							otpMode &&
							!otpVerified && (
								<motion.div
									onClick={() => setExpanded(true)}
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -8 }}
									className="space-y-4"
								>
									<div className="rounded-xl border border-zinc-200 bg-zinc-950 p-4">
										<p className="text-sm font-semibold text-white">
											Enter the {status === "awaiting pickup" ? "pickup " : "drop "} otp from the
											customer&apos;s email.
										</p>
										<p className="text-xs text-zinc-400 mt-1">
											The customer receives this OTP on
											email{" "}
											<span className="text-green-600 font-medium">
												{maskEmail(
													booking?.customer.email,
												)}
											</span>
											, ask them to share it when the
											driver arrives.
										</p>
									</div>

									<div className="max-w-96 mx-auto grid grid-cols-6 gap-2">
										{otpDigits.map((digit, idx) => (
											<input
												key={idx}
												type="text"
												inputMode="numeric"
												maxLength={1}
												value={digit}
												onChange={(e) => {
													const value =
														e.target.value.replace(
															/\D/g,
															"",
														);
													if (!value) {
														setOtpDigits((prev) => {
															const next = [
																...prev,
															];
															next[idx] = "";
															return next;
														});
														return;
													}
													const char =
														value.slice(-1);
													setOtpDigits((prev) => {
														const next = [...prev];
														next[idx] = char;
														return next;
													});
													if (
														char &&
														idx <
															otpDigits.length - 1
													) {
														otpInputsRef.current[
															idx + 1
														]?.focus();
													}
												}}
												onKeyDown={(e) => {
													if (
														e.key === "Backspace" &&
														!digit &&
														idx > 0
													) {
														otpInputsRef.current[
															idx - 1
														]?.focus();
													}
													if (
														e.key === "ArrowLeft" &&
														idx > 0
													) {
														otpInputsRef.current[
															idx - 1
														]?.focus();
													}
													if (
														e.key ===
															"ArrowRight" &&
														idx <
															otpDigits.length - 1
													) {
														otpInputsRef.current[
															idx + 1
														]?.focus();
													}
												}}
												ref={(el) => {
													otpInputsRef.current[idx] =
														el;
												}}
												className="h-14 w-full rounded-2xl border border-zinc-200 bg-white text-center text-lg font-semibold tracking-[0.48em] text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-100"
											/>
										))}
									</div>

									<button
										onClick={() => {
											console.log(status)
											if(status === "awaiting pickup") {
												verifyPickupOtp()
											} else {
												verifyDropOtp();
											}
										}}
										disabled={
											loadingOtp ||
											otpDigits.some((d) => !d)
										}
										className={`w-full rounded-3xl px-4 py-4 text-sm font-bold tracking-widest transition ${loadingOtp || otpDigits.some((d) => !d) ? "bg-zinc-300 text-zinc-500 cursor-not-allowed" : "bg-zinc-900 text-white hover:bg-zinc-800"}`}
									>
										{loadingOtp
											? "Verifying..."
											: `Verify ${status === "awaiting pickup" ? "Pickup " : "Drop "} OTP`}
									</button>

									{otpErr ? (
										<p
											className={`rounded-3xl border px-4 py-3 text-sm font-medium ${otpErr.toLowerCase().includes("success") ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}
										>
											{otpErr}
										</p>
									) : null}

									<div className="grid gap-3 md:grid-cols-2">
										<button
											onClick={() => {
											if(status === "awaiting pickup") {
												sendPickupOtp()
											} else {
												sendDropOtp();
											}
										}}
											disabled={loadingOtp}
											className="w-full rounded-3xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
										>
											Resend otp
										</button>
										<button
											onClick={() => {
												clearOtpDigits();
												setOtpErr("");
											}}
											className="w-full rounded-3xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
										>
											Clear
										</button>
									</div>
								</motion.div>
							)}
					</div>
				</motion.div>
			</div>
		</div>
	);
};

export default Page;
