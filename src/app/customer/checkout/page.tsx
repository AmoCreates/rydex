"use client";
import React from "react";
import { motion } from "motion/react";
import {
	Bike,
	Bus,
	Car,
	Clock4,
	IndianRupee,
	MapPin,
	Package,
	Truck,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { RiSendPlaneFill } from "@remixicon/react";

const VEHICE_META: any = {
	bike: { label: "Bike", Icon: Bike },
	auto: { label: "Auto", Icon: Car },
	car: { label: "Car", Icon: Car },
	loading: { label: "Loading", Icon: Package },
	truck: { label: "Truck", Icon: Truck },
	bus: { label: "Bus", Icon: Bus },
};

const Page = () => {
	const router = useRouter();
	const params = useSearchParams();

	const pickUp = params.get("pickUp") || "";
	const drop = params.get("drop") || "";
	const vehicle = params.get("vehicle") || "";
	const name = params.get("name") || "";
	const mobile = Number(params.get("mobile"));
	const pickupLat = Number(params.get("pickuplat"));
	const pickupLon = Number(params.get("pickuplon"));
	const dropLat = Number(params.get("droplat"));
	const dropLon = Number(params.get("droplon"));
	const distance = Number(params.get("distance") || "0");
	const fare = Number(params.get("fare"));
	const driver = params.get("driver");

	const { Icon, lable } = VEHICE_META[vehicle];

	return (
		<div className="min-h-screen bg-zinc-100 px-4 py-12">
			<div className="relative max-w-6xl mx-auto z-10">
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
					className="mb-10"
				>
					<div className="flex items-center gap-2 mb-2">
						<div className="h-px w-8 bg-zinc-900" />
						<span className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-400">
							Booking
						</span>
					</div>
					<h1 className="text-4xl font-black tracking-tight text-zinc-900">
						Checkout
					</h1>
					<p className="text-zinc-400 text-sm mt-1.5 font-medium">
						Review you ride and confirm
					</p>
				</motion.div>
				<div className="grid lg:grid-cols-2 gap-6">
					{/* Left side: Vehicle Details, Location(Drop, Pickup) and Pricing */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{
							delay: 0.08,
							duration: 0.5,
							ease: [0.22, 1, 0.36, 1],
						}}
						className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.07)]"
					>
						<div className="h-1 bg-zinc-900" />
						<div className="p-8 sm:p-10">
							{/* Selected Vehicle */}
							<div className="flex items-center justify-between mb-8">
								<div>
									<div className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 mb-1">
										Selected Vehicle
									</div>
									<div className="text-3xl font-black tracking-tight text-zinc-900 capitalize">
										{vehicle}
									</div>
								</div>
								<div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center shadow-lg">
									<Icon size={28} className="text-white" />
								</div>
							</div>

							{/* Pickup and Drop */}
							<div className="bg-zinc-50 border border-zinc-100 rounded-2xl overflow-hidden mb-8">
								{/* Pickup Location */}
								<div className="flex gap-4 px-5 py-4 border-b border-zinc-100 items-center">
									<div className="flex flex-col items-center shrink-0 pt-0.5">
										<div className="h-3 w-3 rounded-full bg-zinc-900 border-white ring-1 ring-zinc-300" />
										<div
											className="w-px flex-1 bg-zinc-300 my-1"
											style={{ minHeight: 12 }}
										/>
									</div>
									<div className="flex-1 min-w-0">
										<div className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-400 mb-0.5">
											Pickup
										</div>
										<div className="text-sm font-semibold text-zinc-900 leading-snug truncate">
											{pickUp}
										</div>
									</div>
									<MapPin
										size={16}
										className="text-zinc-400 shrink-0 mt-1"
									/>
								</div>
								{/* Drop Location */}
								<div className="flex gap-4 px-5 py-4 border-b border-zinc-100 items-center">
									<div className="flex flex-col items-center shrink-0 pt-0.5">
										<div className="h-3 w-3 bg-zinc-900 border-white ring-1 ring-zinc-300" />
									</div>
									<div className="flex-1 min-w-0">
										<div className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-400 mb-0.5">
											Drop
										</div>
										<div className="text-sm font-semibold text-zinc-900 leading-snug truncate">
											{drop}
										</div>
									</div>
									<RiSendPlaneFill
										size={16}
										className="text-zinc-400 shrink-0 mt-1"
									/>
								</div>
							</div>

							{/* Pricing */}
							<div className="flex items-end justify-between pt-6 border-t border-zinc-100">
								<div>
									<p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 mb-1">
										Total Fare
									</p>
									<p className="text-zinc-400 text-xs font-medium">
										Includes base fare + distance charges
									</p>
								</div>

								<motion.div
									initial={{ scale: 0.8, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									transition={{
										delay: 0.3,
										type: "spring",
										stiffness: 200,
									}}
									className="flex items-baseline gap-1"
								>
									<span className="text-zinc-400 text-lg font-black">
										<IndianRupee />
									</span>
									<span className="text-zinc-900 text-5xl font-black tracking-tight leading-none">
										{fare}
									</span>
								</motion.div>
							</div>
						</div>
					</motion.div>

					{/* right side: Vehicle Details, Location(Drop, Pickup) and Pricing */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{
							delay: 0.08,
							duration: 0.5,
							ease: [0.22, 1, 0.36, 1],
						}}
						className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.07)] flex flex-col"
					>
						<div className="h-1 bg-zinc-900" />

						<div className="p-8 sm:p-10">
							{/* Selected Vehicle */}

							<div className="mb-8">
								<div className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 mb-1">
									Ready to go!
								</div>
								<div className="text-3xl font-bold tracking-tight text-zinc-900 capitalize">
									Confirm your ride
								</div>
							</div>

							<div className="bg-zinc-50 border border-zinc-100 rounded-2xl overflow-hidden mb-8 gap-3 flex flex-col p-5">
								<div className="flex gap-2 items-center">
									<div className="bg-zinc-200 rounded-xl h-9 w-9 flex justify-center items-center">
										<Clock4 size={15} />
									</div>
									<p className="text-zinc-600">
										Driver will respond within 2 minutes
									</p>
								</div>
								<div className="flex gap-2 items-center">
									<div className="bg-zinc-200 rounded-xl h-9 w-9 flex justify-center items-center">
										<Clock4 size={15} />
									</div>
									<p className="text-zinc-600">
										Driver will respond within 2 minutes
									</p>
								</div>
								<div className="flex gap-2 items-center">
									<div className="bg-zinc-200 rounded-xl h-9 w-9 flex justify-center items-center">
										<Clock4 size={15} />
									</div>
									<p className="text-zinc-600">
										Driver will respond within 2 minutes
									</p>
								</div>
							</div>
						</div>
					</motion.div>
				</div>
			</div>
		</div>
	);
};

export default Page;
