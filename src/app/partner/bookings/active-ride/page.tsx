"use client";
import LiveRideMap from "@/components/LiveRideMap";
import { IBooking } from "@/model/booking.model";
import axios from "axios";
import { CircleDashed, Zap } from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import PanleContent from "@/components/PanleContent";

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

			const watcher = navigator.geolocation.watchPosition(
				({ coords }) => {
					const lon = coords.longitude;
					const lat = coords.latitude;
					setDriverPos([lat, lon]);
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
	}, []);

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
	const displayTime =
	status === "awaiting pickup" ? estPickUpTime : estDropTime;
	const displayDistance =
	status === "awaiting pickup" ? dstToPickUp : dstToDrop;
	const panelProps = {isActive, displayDistance, displayTime, cfg, status, booking };

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

			<motion.div
				initial={{ x: 60, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
				className="hidden lg:flex w-[420px] lg:w-[460px] xl:w-[560px] bg-white border-l border-zinc-100 flex-col"
			>
				<div className="bg-zinc-950 px-6 py-5 shrink-0">
					<p className="text-zinc-500 text-[10px] tracking-[0.2em] uppercase font-semibold mb-1">
						Driver Panel
					</p>
					<div className="flex items-center justify-between">
						<h1 className="text-white text-xl font-bold">
							Active Ride
						</h1>
						{isActive && <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
						<Zap size={12} className="text-amber-400"/>
						<span className="text-white text-xs font-semibold">{Math.round(displayTime)} min</span>
						</div>}
					</div>
				</div>

				<div className="flex-1 flex-col overflow-hidden">
					<div className="flex-1 overflow-y-auto scrollbar-hide">
						<PanleContent {...panelProps}/>
					</div>
				</div>
			</motion.div>
		</div>
	);
};

export default Page;
