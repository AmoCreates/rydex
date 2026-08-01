"use client";
import LiveRideMap from "@/components/LiveRideMap";
import { IBooking } from "@/model/booking.model";
import axios from "axios";
import { CircleDashed } from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";

const getStatus = (status: string | undefined) => {
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
	const [loading, setLoading] = useState(false);
	const [driverPos, setDriverPos] = useState<[number, number] | null>(null);
	const [pickUpPos, setPickUpPos] = useState<[number, number] | null>(null);
	const [dropPos, setDropPos] = useState<[number, number] | null>(null);

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

	const cfg = getStatus(booking?.bookingStatus ?? "confirmed");

	return (
		<div className="h-screen w-full bg-zinc-100 flex flex-col lg:flex-col overflow-hidden">
			<div className="realtive flex-1 h-full z-0">
				<LiveRideMap
					driverLocation={driverPos}
					pickUpLocation={pickUpPos}
					dropLocation={dropPos}
					status={booking?.bookingStatus}
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
		</div>
	);
};

export default Page;
