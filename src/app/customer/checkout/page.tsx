"use client";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
	ArrowLeft,
	Bike,
	Bus,
	Car,
	Clock4,
	CreditCard,
	IndianRupee,
	MapPin,
	Package,
	ShieldCheck,
	Truck,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { RiSendPlaneFill } from "@remixicon/react";
import axios from "axios";

const VEHICE_META: any = {
	bike: { label: "Bike", Icon: Bike },
	auto: { label: "Auto", Icon: Car },
	car: { label: "Car", Icon: Car },
	loading: { label: "Loading", Icon: Package },
	truck: { label: "Truck", Icon: Truck },
	bus: { label: "Bus", Icon: Bus },
};

type Status =
	| "idle"
	| "requested"
	| "awaiting payment"
	| "rejected"
	| "expired"
	| "cancelled"
	| "payment"
	| "confirmed";

const Page = () => {
	const router = useRouter();
	const params = useSearchParams();

	const pickUp = params.get("pickUp") || "";
	const drop = params.get("drop") || "";
	const vehicle = params.get("vehicle") || "";
	const name = params.get("name") || "";
	const mobile = Number(params.get("mobile"));
	const pickupLat = Number(params.get("pickupLat"));
	const pickupLon = Number(params.get("pickupLon"));
	const dropLat = Number(params.get("dropLat"));
	const dropLon = Number(params.get("dropLon"));
	const distance = Number(params.get("distance") || "0");
	const fare = Math.round(Number(params.get("fare")));
	const driverId = params.get("driver") || "";
	const vehicleId = params.get("vehicleId") || "";

	const { Icon, label } = VEHICE_META[vehicle];

	const [status, setStatus] = useState<Status>("idle");

	const handleBookRequest = async () => {
		try {
			console.log(pickupLon, pickupLat, dropLat, dropLon)
			const { data } = await axios.post("/api/booking/create", {
				driverId,
				vehicleId,
				pickUpAddress:pickUp,
				dropAddress: drop,
				pickUpLocation: {
					type: "Point",
					coordinates: [pickupLon, pickupLat]
				},
				dropLocation: {
					type: "Point",
					coordinates: [dropLon, dropLat]
				},
				fare,
				customerName: name,
				customerMobile: mobile,
				distance,
			});

			console.log(data);
		} catch (error: any) {
			console.log(error?.response.data.message);
		}
	};

	useEffect(() => {
		const activeBooking = async () => {
			try {
				const {data}= await axios.get("/api/booking/active-booking");
				console.log(data);
			} catch (error:unknown) {
				console.log(error);
			}
		}

		activeBooking();
	})

	return (
		<div className="min-h-screen bg-zinc-100 px-4 py-12">
			<div className="relative max-w-6xl mx-auto z-10">
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
					className="mb-10 relative"
				>
					<motion.button
						whileTap={{ scale: 0.88 }}
						onClick={() => router.back()}
						className="absolute right-0 top-5 w-11 h-11 rounded-full bg-white border border-zinc-200 shadow-md flex items-center justify-center hover:bg-zinc-50 transition-colors cursor-pointer"
					>
						<ArrowLeft />
					</motion.button>

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

					{/* right side */}
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

						<div className="p-8 sm:p-10 flex-1 flex-col">
							<AnimatePresence mode="wait">
								{status === "idle" && (
									<motion.div
										key="idle"
										initial={{ opacity: 0, y: 12 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -12 }}
										transition={{ duration: 0.3 }}
										className="flex flex-col flex-1 justify-between"
									>
										<div>
											<p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 mb-1">
												Ready to Go!
											</p>
											<h3 className="text-2xl font-black text-zinc-900 mb-2">
												Comfirm Your Ride
											</h3>
											<div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-5 space-y-3">
												{[
													{
														icon: (
															<Clock4 size={14} />
														),
														text: "Driver will respond within 2 minutes",
													},
													{
														icon: (
															<ShieldCheck
																size={14}
															/>
														),
														text: "Verified and ensure drivers only",
													},
													{
														icon: (
															<CreditCard
																size={14}
															/>
														),
														text: "Pay after driver accepts",
													},
												].map((item, idx) => (
													<div
														key={idx}
														className="flex items-center gap-3"
													>
														<div className="w-7 h-7 rounded-xl bg-zinc-200 flex items-center justify-center text-zinc-600 shrink-0">
															{item.icon}
														</div>
														<p className="text-zinc-500 text-xs font-medium">
															{item.text}
														</p>
													</div>
												))}
											</div>
										</div>

										<motion.button
											onClick={handleBookRequest}
											whileTap={{ scale: 0.97 }}
											whileHover={{ scale: 1.02 }}
											className="w-full h-14 mt-8 bg-zinc-900 hover:bg-black disalbed-opacity-40 disabled:pointer-events-none text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2.5 transition-colors shadow-md cursor-pointer group overflow-x-hidden"
										>
											Request Ride{" "}
											<Icon className="group-hover:translate-x-2 group-focus:translate-x-96 transition-transform duration-700" />
										</motion.button>
									</motion.div>
								)}
							</AnimatePresence>
							<div className="text-[9px] uppercase font-semibold tracking-[0.18em] text-zinc-400 gap-2 mt-7 flex items-center justify-center">
								<ShieldCheck size={14} /> secure & verified
								payment
							</div>
						</div>
					</motion.div>
				</div>
			</div>
		</div>
	);
};

export default Page;
