"use client";
import axios from "axios";
import { ChevronUp, CircleDashed, HandCoins, Zap } from "lucide-react";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import PanleContent from "@/components/PanleContent";
import { IUser } from "@/model/user.model";
import { BookingStatus, PaymentStatus } from "@/model/booking.model";
import { useParams } from "next/navigation";
import { getSocket } from "@/lib/socket";
import CompletedScreen from "@/components/CompletedScreen";
import dynamic from "next/dynamic";
import ApiErrorBanner from "@/components/ApiErrorBanner";
const LiveRideMap = dynamic(() => import("@/components/LiveRideMap"), {
	ssr: false,
});

interface IBooking {
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
				sublabel: "Arriving to the pickup location",
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
	requested: { label: "Cash Requested", cls: "bg-blue-100 text-blue-700" },
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
	const [cashRequested, setCashRequested] = useState(false);
	const [errMsg, setErrMsg] = useState("");
	const { id } = useParams();

	const hanldeCashRequest = async () => {
		try {
			setErrMsg("");
			setCashRequested(true);
			const { data } = await axios.post(
				`/api/payment/${id}/cash-request`,
			);
			console.log(data);
			if (data.success) {
				setErrMsg("");
				const socket = getSocket();
				socket?.emit("cash-request", { bookingId: id });
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
				serverMessage ||
					axiosError?.response?.data ||
					axiosError?.message ||
					error,
			);
			setErrMsg(
				serverMessage ||
					"Failed to send cash request, refresh the page and try again",
			);
		}
	};

	useEffect(() => {
		const getActiveRides = async () => {
			try {
				setLoading(true);
				const { data } = await axios.post("/api/bookings/active-ride", {
					bookingId: id,
				});
				console.log(data);
				if (data.success) {
					setBooking(data.booking);
					setStatus(data.booking.bookingStatus);
					setPickUpPos(
						data.booking.pickUpLocation.coordinates.toReversed(),
					);
					setDropPos(
						data.booking.dropLocation.coordinates.toReversed(),
					);
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
	}, [id]);

	// room
	useEffect(() => {
		const socket = getSocket();
		if (!socket) return;
		socket.connect();
		socket.emit("join-ride", id);
		const handler = async ({
			latitude,
			longitude,
			bStatus,
		}: {
			latitude: number;
			longitude: number;
			bStatus: BookingStatus;
		}) => {
			setDriverPos([latitude, longitude]);
			setStatus(bStatus);
			setBooking((prev) =>
				prev
					? { ...prev, bookingStatus: bStatus as BookingStatus }
					: prev,
			);
		};

		socket.on("driver-location", handler);

		return () => {
			socket.off("driver-location", handler);
		};
	}, [id, status]);

	useEffect(() => {
		const socket = getSocket();
		socket?.on("cash-received", () => {
			setStatus("completed");
			setBooking((prev) =>
				prev
					? {
							...prev,
							bookingStatus: "completed",
							paymentStatus: "paid",
						}
					: prev,
			);
		});

		socket?.on("cash-declined", () => {
			console.log("cash-declined socket");
			setStatus("awaiting payment");
			setCashRequested(false);
			setBooking((prev) =>
				prev
					? {
							...prev,
							bookingStatus: "awaiting payment",
							paymentStatus: "pending",
						}
					: prev,
			);
		});

		return () => {
			socket?.off("cash-received");
			socket?.off("cash-declined");
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

	if (status === "completed" && booking && booking.paymentStatus === "paid") {
		return <CompletedScreen booking={booking} role="customer" />;
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
		currRole: "customer",
	};

	return (
		<div className="relative h-screen w-full bg-zinc-100 flex flex-col lg:flex-row overflow-hidden">
			<div className=" absolute top-7 left-1/2 -translate-x-1/2 z-[9999]">
				<ApiErrorBanner message={errMsg} />
			</div>
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

			<motion.div
				initial={{ x: 60, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
				className="hidden lg:flex w-[420px] lg:w-[460px] xl:w-[500px] bg-white border-l border-zinc-100 flex-col"
			>
				<div className="bg-zinc-950 px-6 py-5 shrink-0">
					<p className="text-zinc-500 text-[10px] tracking-[0.2em] uppercase font-semibold mb-1">
						Customer Panel
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
					<div className="shrink-0 border-t border-zinc-100 bg-white px-3 py-4">
						<AnimatePresence mode="wait">
							{status === "awaiting payment" && (
								<motion.button
									onClick={hanldeCashRequest}
									key="payment"
									initial={{ opacity: 0, y: 6 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -6 }}
									className={`w-full ${cashRequested ? "bg-zinc-600" : "bg-zinc-900 hover:bg-zinc-800 active:scale-97 cursor-pointer"}  text-white py-4 rounded-xl font-bold text-sm tracking-wider transition-all flex items-center justify-center gap-2 disabled-cursor-not-allowed disabled-pointer-events-none`}
									disabled={cashRequested}
								>
									{!cashRequested && <HandCoins size={16} />}{" "}
									<p>
										{cashRequested
											? "Waiting for Ryder Confirmation..."
											: "Pay Cash"}
									</p>
								</motion.button>
							)}
						</AnimatePresence>
					</div>
				</motion.div>
			</div>
		</div>
	);
};

export default Page;
