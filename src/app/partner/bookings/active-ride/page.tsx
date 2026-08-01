"use client";
import LiveRideMap from "@/components/LiveRideMap";
import { IBooking } from "@/model/booking.model";
import axios from "axios";
import { CircleDashed } from "lucide-react";
import React, { useEffect, useState } from "react";

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
					setPickUpPos(data.booking.pickUpLocation.coordinates.toReversed());
					setDropPos(data.booking.dropLocation.coordinates.toReversed());
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

	return (
		<div className="h-screen w-full bg-zinc-100 flex flex-col lg:flex-col overflow-hidden">
			<div className="realtive flex-1 h-full z-0">
				<LiveRideMap
					driverLocation={driverPos}
					pickUpLocation={pickUpPos}
					dropLocation={dropPos}
				/>
			</div>
		</div>
	);
};

export default Page;
