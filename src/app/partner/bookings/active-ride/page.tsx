"use client";
import axios from "axios";
import {
	ArrowRight,
	ChevronUp,
	CircleDashed,
	HandCoins,
	IndianRupee,
	MapPin,
	Phone,
	UserRound,
	Zap,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import PanleContent from "@/components/PanleContent";
import { IUser } from "@/model/user.model";
import { BookingStatus, PaymentStatus } from "@/model/booking.model";
import { getSocket } from "@/lib/socket";
import CompletedScreen from "@/components/CompletedScreen";
import { RiSendPlaneFill } from "@remixicon/react";
import dynamic from "next/dynamic";
import ApiErrorBanner from "@/components/ApiErrorBanner";
const LiveRideMap = dynamic(() => import("@/components/LiveRideMap"), {
	ssr: false,
});

interface IBooking {
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
		case "confirmed":
			return {
				label: "Heading to Pickup",
				sublabel: "Drive to the pickup location",
				dot: "bg-amber-400",
			};
		case "started":
			return {
				label: "Ride in Progress",
				sublabel: "Heading to drop location",
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
	requested: {
		label: "Cash Requested",
		cls: "bg-blue-100 text-blue-700",
	},
	pending: { label: "Pending", cls: "bg-amber-100 text-amber-700" },
	paid: { label: "Paid", cls: "bg-emerald-100 text-emerald-700" },
	failed: { label: "Failed", cls: "bg-red-100 text-red-700" },
};

const Page = () => {
	const [booking, setBooking] = useState<IBooking | null>(null);
	const [status, setStatus] = useState("confirmed");
	const [loading, setLoading] = useState(false);
	const [driverPos, setDriverPos] = useState<[number, number] | null>(null);
	const [pickUpPos, setPickUpPos] = useState<[number, number] | null>(null);
	const [dropPos, setDropPos] = useState<[number, number] | null>(null);
	const [dstToPickUp, setDstToPickUp] = useState(0);
	const [dstToDrop, setDstToDrop] = useState(0);
	const [estPickUpTime, setEstPickUpTime] = useState(0);
	const [estDropTime, setEstDropTime] = useState(0);
	const [expanded, setExpanded] = useState(false);

	const statusRef = useRef(status);
	const bookingRef = useRef(booking);

	const [otpMode, setOtpMode] = useState(false);
	const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
	const desktopOtpInputsRef = useRef<Array<HTMLInputElement | null>>([]);
	const mobileOtpInputsRef = useRef<Array<HTMLInputElement | null>>([]);
	const [loadingOtp, setLoadingOtp] = useState(false);
	const [otpErr, setOtpErr] = useState("");
	const [otpVerified, setOtpVerified] = useState(false);
	const [cashRequested, setCashRequested] = useState(false);
	const [errMsg, setErrMsg] = useState("");

	const clearOtpDigits = () => setOtpDigits(Array(6).fill(""));

	const sendPickupOtp = async () => {
		if (status !== "confirmed" || otpVerified) return;
		try {
			setErrMsg("");
			setLoadingOtp(true);
			clearOtpDigits();
			const { data } = await axios.post(
				"/api/partner/bookings/otp/pickup/send",
				{ bookingId: booking?._id },
			);
			if (data.success) {
				setErrMsg("");
				setOtpMode(true);
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
			setErrMsg(
				serverMessage ||
					"Failed to send pickup OTP, refresh the page and try again",
			);
		} finally {
			setLoadingOtp(false);
		}
	};
	const sendDropOtp = async () => {
		if (status !== "started") return;
		try {
			setErrMsg("");
			setLoadingOtp(true);
			setOtpErr("");
			clearOtpDigits();
			const { data } = await axios.post(
				"/api/partner/bookings/otp/drop/send",
				{ bookingId: booking?._id },
			);
			if (data.success) {
				setOtpMode(true);
				setOtpVerified(false);
				setErrMsg("");
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
			setErrMsg(
				serverMessage ||
					"Failed to send drop OTP, refresh the page and try again",
			);
		} finally {
			setLoadingOtp(false);
		}
	};
	const verifyPickupOtp = async () => {
		if (status !== "confirmed" || !otpMode || otpVerified) return;
		const otp = otpDigits.join("");
		if (otp.length !== 6) {
			setOtpErr("Enter all 6 digits to verify the pickup otp.");
			return;
		}
		try {
			setErrMsg("");
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
				setOtpMode(false);
				setErrMsg("");
				const socket = getSocket();
				if (driverPos) {
					socket?.emit("driver-location-update", {
						bookingId: booking?._id,
						status: "started",
						latitude: driverPos[0],
						longitude: driverPos[1],
					});
				}
			} else {
				setOtpErr(data.message || "Unable to verify the pickup OTP.");
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
			setErrMsg(
				serverMessage ||
					"Failed to verify pickup OTP, refresh the page and try again",
			);
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
			setErrMsg("");
			setLoadingOtp(true);
			setOtpErr("");
			const { data } = await axios.post(
				"/api/partner/bookings/otp/drop/verify",
				{ bookingId: booking?._id, otp },
			);

			if (data.success) {
				setOtpVerified(true);
				setStatus(data.booking.bookingStatus);
				setBooking((prev) =>
					prev
						? { ...prev, bookingStatus: data.booking.bookingStatus }
						: prev,
				);
				setOtpErr("Pickup verified. Ride started.");
				setErrMsg("");

				const socket = getSocket();
				if (driverPos) {
					socket?.emit("driver-location-update", {
						bookingId: booking?._id,
						status: data.booking.bookingStatus,
						latitude: driverPos[0],
						longitude: driverPos[1],
					});
				}
			} else {
				setOtpErr(data.message || "Unable to verify the pickup OTP.");
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
			setErrMsg(
				serverMessage ||
					"Failed to verify drop OTP, refresh the page and try again",
			);
		} finally {
			setLoadingOtp(false);
		}
	};

	function maskEmail(email: string | undefined) {
		return email!.replace(/(?<=^.{2}).+(?=.+@)/, "*****");
	}

	const handleCashPayment = async () => {
		if (!cashRequested) return;
		try {
			setErrMsg("");
			const { data } = await axios.post("/api/payment/cash");
			if (data.success) {
				setErrMsg("");
				setCashRequested(false);
				setStatus("completed");

				const socket = getSocket();
				socket?.emit("cash-received", { bookingId: booking?._id });
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
			setErrMsg(
				serverMessage ||
					"Failed to accept cash, refresh the page and try again",
			);
		}
	};

	const cashRequestedDeclined = async () => {
		try {
			setErrMsg("");
			const { data } = await axios.post(
				`/api/payment/${booking!._id}/cash-decline`,
			);
			if (data.success) {
				setCashRequested(false);
				setErrMsg("");
				const socket = getSocket();
				socket?.emit("cash-declined", { bookingId: booking!._id });
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
			setErrMsg(
				serverMessage ||
					"Failed to decline the cash, refresh the page and try again",
			);
		}
	};

	// Fetch Active Ride
	useEffect(() => {
		const getActiveRides = async () => {
			try {
				setErrMsg("");
				setLoading(true);
				const { data } = await axios.get(
					"/api/partner/bookings/active-ride",
				);
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
					setErrMsg("");
				}
			} catch (error: unknown) {
				console.log(error);
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
					serverMessage ||
						axiosError?.response?.data ||
						axiosError?.message ||
						error,
				);
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

	// Update Driver's Live Location to Customer Side: (Socket.io)
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

	useEffect(() => {
		statusRef.current = status;
		bookingRef.current = booking;
	}, [status, booking]);

	useEffect(() => {
		const cashReuqest = async () => {
			try {
				setErrMsg("");
				const { data } = await axios.get("/api/payment/cash");
				if (data.success) {
					setErrMsg("");
					setCashRequested(true);
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
				setErrMsg(
					serverMessage ||
						"Failed to send fetch customer's cash request, refresh the page and try again",
				);
			}
		};
		cashReuqest();
	}, [status]);

	useEffect(() => {
		const socket = getSocket();
		socket?.on("cash-requested", () => {
			setCashRequested(true);
		});

		socket?.on("ride-confirmed", () => {
			setStatus("confirmed");
			setBooking((prev) =>
				prev
					? {
							...prev,
							bookingStatus: "confirmed",
							paymentStatus: "pending",
						}
					: prev,
			);
		});

		return () => {
			socket?.off("cash-requested");
			socket?.off("ride-confirmed");
		};
	});

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

	if (status === "completed" && booking) {
		return <CompletedScreen booking={booking} role={"driver"} />;
	}

	const cfg = getStatusStyle(booking?.bookingStatus ?? "confirmed");
	const isActive = ["confirmed", "started"].includes(status);
	const paymentStatus = PAYMENT_BADGE[booking?.paymentStatus ?? "pending"];
	const displayTime = status === "confirmed" ? estPickUpTime : estDropTime;
	const displayDistance = status === "confirmed" ? dstToPickUp : dstToDrop;
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
		<div className="absolute h-screen w-full bg-zinc-100 flex flex-col lg:flex-row overflow-hidden">
			<div className=" absolute top-7 left-1/2 -translate-x-1/2 z-[9999]">
				<ApiErrorBanner message={errMsg} />
			</div>

			{/* Map & Status Label */}
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

			{/* Panel: Desktop View*/}
			{/* Header View Common in Both(Large, Small Devices) */}
			<motion.div
				initial={{ x: 60, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
				className="hidden lg:flex w-[420px] lg:w-[460px] xl:w-[500px] bg-white border-l border-zinc-100 flex-col"
			>
				{/* Panel Header */}
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

				{/* Panel Content: Booking Details, Ride-Chat, OTP Verification */}
				<div className="flex-1 flex-col overflow-hidden">
					{/* Panel Content: Booking Details, Ride-Chat */}
					<div className="flex-1 overflow-y-auto">
						<PanleContent {...panelProps} />
					</div>

					{/* Panel Content: OTP Verification */}
					<div className="shrink-0 border-t border-zinc-100 bg-white px-5 py-4">
						{/* Button: Send Pickup OTP */}
						<AnimatePresence mode="wait">
							{status === "confirmed" && !otpMode && (
								<motion.button
									onClick={sendPickupOtp}
									key="arrived"
									initial={{ opacity: 0, y: 6 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -6 }}
									className={`w-full ${loadingOtp ? "bg-zinc-600" : "bg-zinc-900 hover:bg-zinc-800 active:scale-97 cursor-pointer"}  text-white py-4 rounded-xl font-bold text-sm tracking-wider transition-all flex items-center justify-center gap-2 disabled-cursor-not-allowed disabled-pointer-events-none`}
									disabled={loadingOtp}
								>
									{!loadingOtp && <MapPin size={16} />}{" "}
									<p>
										{loadingOtp
											? "Sending Pikcup OTP..."
											: "I've Arrived at Pickup"}
									</p>
									<ArrowRight
										size={15}
										className={`${loadingOtp ? "hidden" : "flex"} ml-1`}
									/>
								</motion.button>
							)}

							{/* Button: Send Drop OTP */}
							{status === "started" && !otpMode && (
								<motion.button
									onClick={sendDropOtp}
									key="dropped"
									initial={{ opacity: 0, y: 6 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -6 }}
									className={`w-full ${loadingOtp ? "bg-emerald-300" : "bg-emerald-600 hover:bg-emerald-500 active:scale-97 cursor-pointer"} text-white py-4 rounded-xl font-bold text-sm tracking-wider transition-all flex items-center justify-center gap-2 disabled-cursor-not-allowed disabled-pointer-events-none`}
									disabled={loadingOtp}
								>
									{!loadingOtp && (
										<RiSendPlaneFill size={16} />
									)}{" "}
									<p>
										{loadingOtp
											? "Sending Drop OTP..."
											: "Mark As Dropped"}
									</p>
									<ArrowRight
										size={15}
										className={`${loadingOtp ? "hidden" : "flex"} ml-1`}
									/>
								</motion.button>
							)}
						</AnimatePresence>

						{/* OTP: Verify, Input, Clear, Resend */}
						{(status === "confirmed" || status === "started") &&
							otpMode &&
							!otpVerified && (
								<motion.div
									onClick={() => setExpanded(true)}
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -8 }}
									className="space-y-4"
								>
									{/* Message for Driver */}
									<div className="rounded-xl border border-zinc-200 bg-zinc-950 p-4">
										<p className="text-sm font-semibold text-white">
											Enter the{" "}
											{status === "confirmed"
												? "pickup "
												: "drop "}{" "}
											otp from the customer&apos;s email.
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

									{/* OTP Input Boxes */}
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
														desktopOtpInputsRef.current[
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
														desktopOtpInputsRef.current[
															idx - 1
														]?.focus();
													}
													if (
														e.key === "ArrowLeft" &&
														idx > 0
													) {
														desktopOtpInputsRef.current[
															idx - 1
														]?.focus();
													}
													if (
														e.key ===
															"ArrowRight" &&
														idx <
															otpDigits.length - 1
													) {
														desktopOtpInputsRef.current[
															idx + 1
														]?.focus();
													}
												}}
												ref={(el) => {
													desktopOtpInputsRef.current[
														idx
													] = el;
												}}
												className="h-14 w-full rounded-2xl border border-zinc-200 bg-white text-center text-lg font-semibold tracking-[0.48em] text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-100"
											/>
										))}
									</div>

									{/* Verify OTP: Pickup/Drop  */}
									<button
										onClick={() => {
											if (status === "confirmed") {
												verifyPickupOtp();
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
											: `Verify ${status === "confirmed" ? "Pickup " : "Drop "} OTP`}
									</button>

									{/* OTP Error UI */}
									{otpErr ? (
										<p
											className={`rounded-3xl border px-4 py-3 text-sm font-medium ${otpErr.toLowerCase().includes("success") ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}
										>
											{otpErr}
										</p>
									) : null}

									{/* Clear & Resend */}
									<div className="grid gap-3 md:grid-cols-2">
										{/* Resend OTP */}
										<button
											onClick={() => {
												if (status === "confirmed") {
													sendPickupOtp();
												} else {
													sendDropOtp();
												}
											}}
											disabled={loadingOtp}
											className="w-full rounded-3xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
										>
											Resend otp
										</button>
										{/* Resend OTP */}
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
				</div>
			</motion.div>

			{/* Panel: Mobile or Small Screen View */}
			<div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 pointer-events-none">
				<motion.div
					className="bg-white rounded-t-3xl shadow-2xl pointer-events-auto overflow-hidden flex flex-col"
					animate={{ height: expanded ? "82vh" : 142 }}
					transition={{ type: "spring", stiffness: 320, damping: 38 }}
				>
					{/* Click to Expand */}
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

					{/* Booking Status: Lable, subLabel, Timing and Pricing */}
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

					{/* Panel Content: Booking Details, Ride-Chat*/}
					<div className="flex-1 overflow-y-auto min-h-0">
						<PanleContent {...panelProps} />
					</div>

					{/* Pickup/Drop: OTP Verification */}
					<div className="shrink-0 border-t border-zinc-100 bg-white px-5 py-4">
						{/* Button: Send Pickup OTP */}
						<AnimatePresence mode="wait">
							{status === "confirmed" && !otpMode && (
								<motion.button
									onClick={sendPickupOtp}
									key="arrived"
									initial={{ opacity: 0, y: 6 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -6 }}
									className={`w-full ${loadingOtp ? "bg-zinc-600" : "bg-zinc-900 hover:bg-zinc-800 active:scale-97 cursor-pointer"}  text-white py-4 rounded-xl font-bold text-sm tracking-wider transition-all flex items-center justify-center gap-2 disabled-cursor-not-allowed disabled-pointer-events-none`}
									disabled={loadingOtp}
								>
									{!loadingOtp && <MapPin size={16} />}{" "}
									<p>
										{loadingOtp
											? "Sending Pikcup OTP..."
											: "I've Arrived at Pickup"}
									</p>
									<ArrowRight
										size={15}
										className={`${loadingOtp ? "hidden" : "flex"} ml-1`}
									/>
								</motion.button>
							)}

							{/* Button: Send Drop OTP */}
							{status === "started" && !otpMode && (
								<motion.button
									onClick={sendDropOtp}
									key="dropped"
									initial={{ opacity: 0, y: 6 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -6 }}
									className={`w-full ${loadingOtp ? "bg-emerald-300" : "bg-emerald-600 hover:bg-emerald-500 active:scale-97 cursor-pointer"}  text-white py-4 rounded-xl font-bold text-sm tracking-wider transition-all flex items-center justify-center gap-2 disabled-cursor-not-allowed disabled-pointer-events-none`}
									disabled={loadingOtp}
								>
									{!loadingOtp && (
										<RiSendPlaneFill size={16} />
									)}{" "}
									<p>
										{loadingOtp
											? "Sending Drop OTP..."
											: "Mark As Dropped"}
									</p>
									<ArrowRight
										size={15}
										className={`${loadingOtp ? "hidden" : "flex"} ml-1`}
									/>
								</motion.button>
							)}
						</AnimatePresence>

						{/* OTP: Verify, Input, Clear, Resend */}
						{(status === "confirmed" || status === "started") &&
							otpMode &&
							!otpVerified && (
								<motion.div
									onClick={() => setExpanded(true)}
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -8 }}
									className="space-y-4"
								>
									{/* Message for Driver */}
									<div className="rounded-xl border border-zinc-200 bg-zinc-950 p-4">
										<p className="text-sm font-semibold text-white">
											Enter the{" "}
											{status === "confirmed"
												? "pickup "
												: "drop "}{" "}
											otp from the customer&apos;s email.
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

									{/* OTP Input Boxes */}
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
														mobileOtpInputsRef.current[
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
														mobileOtpInputsRef.current[
															idx - 1
														]?.focus();
													}
													if (
														e.key === "ArrowLeft" &&
														idx > 0
													) {
														mobileOtpInputsRef.current[
															idx - 1
														]?.focus();
													}
													if (
														e.key ===
															"ArrowRight" &&
														idx <
															otpDigits.length - 1
													) {
														mobileOtpInputsRef.current[
															idx + 1
														]?.focus();
													}
												}}
												ref={(el) => {
													mobileOtpInputsRef.current[
														idx
													] = el;
												}}
												className="h-14 w-full rounded-2xl border border-zinc-200 bg-white text-center text-lg font-semibold tracking-[0.48em] text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-100"
											/>
										))}
									</div>

									{/* Verify OTP: Pickup/Drop */}
									<button
										onClick={() => {
											if (status === "confirmed") {
												verifyPickupOtp();
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
											: `Verify ${status === "confirmed" ? "Pickup " : "Drop "} OTP`}
									</button>

									{/* OTP Error UI */}
									{otpErr ? (
										<p
											className={`rounded-3xl border px-4 py-3 text-sm font-medium ${otpErr.toLowerCase().includes("success") ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}
										>
											{otpErr}
										</p>
									) : null}

									{/* OTP Clear & Resend */}
									<div className="grid gap-3 md:grid-cols-2">
										{/* Resend */}
										<button
											onClick={() => {
												if (status === "confirmed") {
													sendPickupOtp();
												} else {
													sendDropOtp();
												}
											}}
											disabled={loadingOtp}
											className="w-full rounded-3xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
										>
											Resend otp
										</button>
										{/* Clear */}
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

			{/* Cash confirmation popup */}
			{cashRequested && (
				<AnimatePresence>
					<div className="fixed inset-0 z-100 flex items-center justify-center p-4">
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="absolute inset-0 bg-black/60 backdrop-blur-sm"
						/>
						<motion.div
							initial={{ scale: 0.9, opacity: 0, y: 20 }}
							animate={{ scale: 1, opacity: 1, y: 0 }}
							exit={{ scale: 0.9, opacity: 0, y: 20 }}
							className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6"
						>
							<div className=" p-2 text-zinc-600 flex text-sm justify-between font-semibold -mt-2 bg-zinc-300 rounded-xl">
								<h1 className="flex items-center gap-2">
									<UserRound size={16} />
									Customer - {booking?.customerName}
								</h1>
								<h1 className="flex items-center gap-2">
									<Phone size={16} /> Mobile -{" "}
									{booking?.customerMobile}
								</h1>
							</div>
							<div className="flex items-center gap-3">
								<div
									className={`p-3 rounded-2xl $bg-green-50 text-green-600`}
								>
									<HandCoins size={24} />
								</div>
								<div>
									<div className="flex items-center justify-between">
										<h3 className="text-xl font-bold">
											Accept Cash
										</h3>
										<div className="flex items-center">
											<IndianRupee size={15} />
											<p className="text-2xl font-black">
												{booking?.fare}
											</p>
										</div>
									</div>
									<p className="text-sm text-gray-500">
										This is a confirmation popup. Click Yes
										if you received the cash successfully
									</p>
								</div>
							</div>

							<div className="flex gap-3 pt-2">
								<button
									className="flex-1 py-3 rounded-xl font-semibold text-black bg-gray-300 hover:bg-gray-100 transition-colors cursor-pointer"
									onClick={cashRequestedDeclined}
								>
									Not Paid!
								</button>
								<button
									onClick={handleCashPayment}
									className={`flex-1 py-3 rounded-xl font-semibold text-white transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-black
									}`}
								>
									Yes, Received
								</button>
							</div>
						</motion.div>
					</div>
				</AnimatePresence>
			)}
		</div>
	);
};

export default Page;
