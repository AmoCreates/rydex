"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
	ArrowLeft,
	Bike,
	Bus,
	Car,
	CheckCircle,
	ChevronRight,
	LocateFixed,
	MapPin,
	Package,
	Phone,
	Truck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { RiSendPlaneFill, RiUserLine } from "@remixicon/react";
import axios from "axios";

const stepVariants = {
	hidden: { opacity: 0, y: 16 },
	visible: { opacity: 1, y: 0 },
};

type place = {
	name: string;
	city?: string;
	state?: string;
	country?: string;
	countrycode?: string;
	longitude?: number;
	latitude?: number;
};

const VEHICLES = [
	{ id: "all", label: "All", icon: Bike, desc: "All vehicle in your nearby" },
	{ id: "bike", label: "Bike", icon: Bike, desc: "2 Wheeler" },
	{ id: "auto", label: "Auto", icon: Car, desc: "3 Wheeler ride" },
	{ id: "car", label: "Car", icon: Car, desc: "4 Wheeler ride" },
	{ id: "loading", label: "Loading", icon: Package, desc: "Small goods" },
	{ id: "truck", label: "Truck", icon: Truck, desc: "Heavy transport" },
	{ id: "bus", label: "Bus", icon: Bus, desc: "Passenger" },
];

const Page = () => {
	const [vehicle, setVehicle] = useState("");
	const [name, setName] = useState("");
	const [mobile, setMobile] = useState("");
	const [pickUp, setPickUp] = useState("");
	const [drop, setDrop] = useState("");
	const [pickUpCountry, setPickUpCountry] = useState<string | undefined>("");
	const [pickUpLongitude, setPickUpLongitude] = useState<number | null>(null);
	const [pickUpLatitude, setPickUpLatitude] = useState<number | null>(null);
	const [dropLongitude, setDropLongitude] = useState<number | null>(null);
	const [dropLatitude, setDropLatitude] = useState<number | null>(null);
	const [pickupSuggestion, setPickupSuggestion] = useState<place[]>([]);
	const [dropSuggestion, setDropSuggestion] = useState<place[]>([]);
	const [loading, setLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [toFill, setToFill] = useState("Select a vehicle");
	const isBusy = loading || isSubmitting;
	const progress = [
		!!vehicle,
		!!name,
		!!(mobile.length === 10),
		!!pickUp,
		!!drop,
	].filter(Boolean).length;
	const router = useRouter();

	const getCurrentLocation = async () => {
		setLoading(true);
		if (!navigator.geolocation) {
			console.log("cant find navigator");
			return;
		}
		navigator.geolocation.getCurrentPosition(async ({ coords }) => {
			try {
				const { data } = await axios.get(
					`https://photon.komoot.io/reverse?lon=${coords.longitude}&lat=${coords.latitude}`,
				);
				console.log(data);
				if (data.features.length) {
					const currentLocation = `${data.features[0].properties.name}, ${data.features[0].properties.city}, ${data.features[0].properties.state}, ${data.features[0].properties.country}`;

					setPickUpLongitude(
						data.features[0].geometry.coordinates[0],
					);
					setPickUpLatitude(data.features[0].geometry.coordinates[1]);
					setPickUpCountry(data.features[0].properties.country);
					setPickUp(currentLocation);
					setPickupSuggestion([]);
				}
			} catch (error) {
				console.log(error);
			} finally {
				setLoading(false);
			}
		});
	};

	const searchLocation = async (
		q: string,
		setSearch: (r: place[]) => void,
		restrict?: string | null,
	) => {
		if (q.length === 0) {
			setSearch([]);
			return;
		}
		try {
			const { data } = await axios.get(
				`https://photon.komoot.io/api/?q=${encodeURIComponent(q.trim())}&lang=en`,
			);
			let places: place[] = (data.features ?? []).map((f: any) => ({
				name: f.properties.name,
				city: f.properties.city,
				state: f.properties.state,
				country: f.properties.country,
				countrycode: f.properties.countrycode,
				longitude: f.geometry.coordinates[0],
				latitude: f.geometry.coordinates[1],
			}));

			if (restrict) {
				places = places.filter((p) => p.country == restrict);
			}
			setSearch(places);
		} catch (error) {
			console.log(error);
			setSearch([]);
		}
	};

	const suggestion = (p: place) =>
		[p.name, p.city, p.state, p.country].filter(Boolean).join(",");

	return (
		<div className="min-h-screen bg-zinc-100 flex items-center justify-center px-4 py-6">
			<motion.div
				initial={{ opacity: 0, y: 32 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
				className="w-full lg:max-w-130 max-w-md"
				onClick={() => {
					setPickupSuggestion([]);
					setDropSuggestion([]);
				}}
			>
				<header className="flex items-center gap-4 mb-6 px-1">
					<motion.button
						whileTap={{ scale: 0.88 }}
						className="w-11 h-11 rounded-2xl cursor-pointer bg-white border-zinc-200 shadow-sm flex items-center justify-center hover:bg-zinc-50 transition-colors shrink-0"
						onClick={() => router.back()}
					>
						<ArrowLeft className="text-zinc-900" />
					</motion.button>

					<div className="flex-1 min-w-0">
						<h1 className="text-zinc-900 text-xl font-black tracking-tight">
							Book a Ride
						</h1>
						<p className="text-zinc-400 text-xs mt-0.5">
							Fill in the details below
						</p>
					</div>

					<div className="flex items-center gap-1.5 shrink-0">
						{[0, 1, 2, 3, 4].map((d, i) => (
							<motion.div
								key={i}
								animate={{
									width: i < progress ? 20 : 8,
									background:
										i < progress ? "#09090b" : "#d4d4d8",
								}}
								transition={{ duration: 0.3 }}
								className="h-2 rounded-full"
							/>
						))}
					</div>
				</header>

				<main className="bg-white rounded-3xl border border-zinc-200 shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden">
					<div className="h-1 bg-zinc-900 w-full" />
					<div className="p-6 space-y-7">
						{/* Choose Vehicle */}
						<motion.div
							variants={stepVariants}
							initial={"hidden"}
							animate={"visible"}
							transition={{ delay: 0.05 }}
						>
							{/* Step 1 heading */}
							<div className="flex items-center gap-2 mb-3">
								<div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
									<span className="text-white text-[9px] font-black ">
										1
									</span>
								</div>
								<p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
									Choose Vehicle{" "}
									<span className="text-red-500">*</span>
								</p>
							</div>

							<div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
								{VEHICLES.map((v, i) => {
									const Icon = v.icon;
									const isActive = vehicle === v.id;
									return (
										<motion.div
											key={i}
											whileHover={{
												scale: isBusy ? 1 : 1.05,
											}}
											whileTap={{
												scale: isBusy ? 1 : 0.96,
											}}
											onClick={() =>
												!isBusy && setVehicle(v.id)
											}
											className={`relative rounded-2xl border p-4  flex items-center ${v.id} gap-2 transition ${isBusy ? "cursor-not-allowed opacity-70" : "cursor-pointer"} ${isActive ? "bg-black text-white border-black" : "border-gray-200 hover:border-black"} ${v.id === "all" && "col-span-2 "}`}
										>
											{v.id === "all" ? (
												<>
													<div
														className={`w-11 h-11 border border-r rounded-xl flex items-center justify-center ${isActive ? "bg-white text-black" : "bg-black text-white"}`}
													>
														<Icon />
													</div>
													<div
														className={`w-11 border-r border h-11 rounded-xl -ml-4.5 flex items-center justify-center ${isActive ? "bg-white text-black" : "bg-black text-white"}`}
													>
														<Car />
													</div>
													<div
														className={`w-11 h-11 border-r border rounded-xl -ml-4.5 flex items-center justify-center ${isActive ? "bg-white text-black" : "bg-black text-white"}`}
													>
														<Truck />
													</div>
													<div
														className={`w-11 h-11 border-r border rounded-xl -ml-4.5 flex items-center justify-center ${isActive ? "bg-white text-black" : "bg-black text-white"}`}
													>
														<Package />
													</div>
													<div
														className={`w-11 h-11 border-r border  rounded-xl -ml-4.5 flex items-center justify-center ${isActive ? "bg-white text-black" : "bg-black text-white"}`}
													>
														<Bus />
													</div>
												</>
											) : (
												<div
													className={`w-11 h-11 rounded-xl flex items-center justify-center ${isActive ? "bg-white text-black" : "bg-black text-white"} `}
												>
													<Icon />
												</div>
											)}

											<div>
												<div className={` ${v.id === "all" ? "text-xl" : "text-sm"} font-semibold ${v.id === "all" && "text-center"}`}>
													{v.label}
												</div>
												
													<p
														className={`text-xs ${isActive ? "text-gray-300" : "text-gray-500"}  ${v.id === "all" && "text-center"}`}
													>
														{v.desc}
													</p>
												
											</div>

											{isActive && (
												<span className="absolute top-2 right-2 text-white">
													<CheckCircle size={15} />
												</span>
											)}
										</motion.div>
									);
								})}
							</div>
						</motion.div>

						<div className="h-px bg-zinc-200 my-7" />

						{/* Customer Name */}
						<motion.div
							variants={stepVariants}
							initial={"hidden"}
							animate={"visible"}
							transition={{ delay: 0.05 }}
						>
							{/* Step 2 heading */}
							<div className="flex items-center gap-2 mb-3">
								<div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
									<span className="text-white text-[9px] font-black ">
										2
									</span>
								</div>
								<p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
									CUSTOMER NAME{" "}
									<span className="text-red-500">*</span>
								</p>
							</div>

							<div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 focus-within:border-zinc-900 focus-within:bg-white transition-all">
								<div className="w-8 h-8 rounded-xl bg-zinc-200 flex items-center justify-center shrink-0">
									<RiUserLine
										size={18}
										className="text-zinc-800"
									/>
								</div>
								<input
									type="text"
									value={name}
									required
									maxLength={25}
									onClick={() =>
										setToFill("Enter customer name")
									}
									onChange={(e) => {
										setName(e.target.value);
										setToFill("Enter customer name");
									}}
									placeholder="Enter your name"
									className="flex-1 bg-transparent  text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none"
									disabled={isBusy}
								/>
								<AnimatePresence>
									{name.length > 1 && (
										<motion.div
											initial={{ scale: 0 }}
											animate={{ scale: 1 }}
											exit={{ scale: 0 }}
										>
											<CheckCircle
												size={16}
												className="text-emerald-500 fill-emerald-50 shrink-0"
											/>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						</motion.div>

						{/* Mobile Number */}
						<motion.div
							variants={stepVariants}
							initial={"hidden"}
							animate={"visible"}
							transition={{ delay: 0.05 }}
						>
							{/* Step 3 heading */}
							<div className="flex items-center gap-2 mb-3">
								<div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
									<span className="text-white text-[9px] font-black ">
										3
									</span>
								</div>
								<p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
									MOBILE NUMBER{" "}
									<span className="text-red-500">*</span>
								</p>
							</div>

							<div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 focus-within:border-zinc-900 focus-within:bg-white transition-all">
								<div className="w-8 h-8 rounded-xl bg-zinc-200 flex items-center justify-center shrink-0">
									<Phone
										size={18}
										className="text-zinc-800"
									/>
								</div>
								<input
									type="tel"
									value={mobile}
									inputMode="numeric"
									required
									maxLength={10}
									onClick={() =>
										setToFill("Enter a valid mobile number")
									}
									onChange={(e) => {
										setToFill(
											"Enter a valid mobile number",
										);
										setMobile(
											e.target.value.replace(/\D/g, ""),
										);
									}}
									placeholder="Enter your mobile number"
									className="flex-1 bg-transparent text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none"
									disabled={isBusy}
								/>
								<AnimatePresence>
									{mobile.length == 10 && (
										<motion.div
											initial={{ scale: 0 }}
											animate={{ scale: 1 }}
											exit={{ scale: 0 }}
										>
											<CheckCircle
												size={16}
												className="text-emerald-500 fill-emerald-50 shrink-0"
											/>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
							<p className="text-zinc-400 text-xs ml-1">
								Ride update will be sent to this number
							</p>
						</motion.div>

						<div className="h-px bg-zinc-200 my-7" />

						{/* Route: Pickup and drop location */}
						<motion.div
							variants={stepVariants}
							initial={"hidden"}
							animate={"visible"}
							transition={{ delay: 0.05 }}
						>
							{/* Step 4 heading */}
							<div className="flex items-center gap-2 mb-3">
								<div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
									<span className="text-white text-[9px] font-black ">
										4
									</span>
								</div>
								<p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
									ROUTE{" "}
									<span className="text-red-500">*</span>
								</p>
							</div>

							<div className="bg-zinc-50 border border-zinc-200 rounded-2xl overflow-visible">
								{/* Pickup */}
								<div className="relative z-30">
									<div className="flex items-center gap-3 px-4 py-3.5 focus-within:bg-white rounded-t-2xl transition-colors">
										<div className="flex flex-col items-center shrink-0">
											<div className="w-3 h-3 rounded-full bg-zinc-900 border-2 border-white shoadow" />
											<div className="w-px h-5 bg-zinc-300 mt-1" />
										</div>
										<input
											onClick={() => {
												setToFill(
													"Enter pickup location, either you can select or type manually",
												);
												setPickupSuggestion([]);
											}}
											onChange={(e) => {
												setToFill(
													"Enter pickup location, either you can select or type manually",
												);
												setPickUp(e.target.value);
												searchLocation(
													e.target.value,
													setPickupSuggestion,
												);
											}}
											value={pickUp}
											placeholder={`${loading ? "Finding you" : "PickUp location"}`}
											className="flex-1 bg-transparent text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none disabled:cursor-not-allowed"
											disabled={isBusy}
										/>
										<div className="flex flex-col items-center">
											<motion.button
												whileTap={{ scale: 0.8 }}
												className="w-8 h-8 rounded-xl bg-zinc-200 hover:bg-zinc-300 transition-colors flex items-center justify-center shrink-0 cursor-pointer disabled:cursor-not-allowed"
												disabled={loading}
												onClick={getCurrentLocation}
											>
												<LocateFixed
													size={14}
													className={`text-zinc-700 ${loading && "animate-spin"}`}
												/>
											</motion.button>
											<p className="text-xs text-zinc-400">
												{loading
													? "finding"
													: "find me"}
											</p>
										</div>
									</div>

									{/* Suggestions */}
									<AnimatePresence>
										{pickupSuggestion.length > 0 && (
											<motion.div
												initial={{
													opacity: 0,
													y: -4,
													scale: 0.98,
												}}
												animate={{
													opacity: 1,
													y: 0,
													scale: 1,
												}}
												exit={{
													opacity: 0,
													y: -4,
													scale: 0.98,
												}}
												transition={{ duration: 0.2 }}
												className="absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-200 rounded-2xl shadow-2xl max-h-42 overflow-y-auto z-50"
											>
												{pickupSuggestion.map(
													(p, i) => {
														return (
															<motion.div
																key={i}
																onClick={() => {
																	setPickUp(
																		suggestion(
																			p,
																		),
																	);
																	setPickupSuggestion(
																		[],
																	);
																	setPickUpCountry(
																		p.country,
																	);
																	setPickUpLatitude(
																		p.latitude!,
																	);
																	setPickUpLatitude(
																		p.longitude!,
																	);
																}}
																initial={{
																	opacity: 0,
																}}
																animate={{
																	opacity: 1,
																}}
																transition={{
																	delay:
																		i *
																		0.03,
																}}
																className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-zinc-50 transition-colors border-b  border-zinc-100 last:border-0"
															>
																<MapPin
																	size={13}
																	className="text-zinc-400 shrink-0"
																/>
																<span className="text-sm text-zinc-800 font-medium truncate">
																	{suggestion(
																		p,
																	)}
																</span>
																<ChevronRight
																	size={13}
																	className="text-zinc-400 shrink-0 ml-auto"
																/>
															</motion.div>
														);
													},
												)}
											</motion.div>
										)}
									</AnimatePresence>
								</div>

								<div className="h-px bg-zinc-300 mx-4" />

								{/* Drop */}
								<div className="relative z-20">
									<div className="flex items-center gap-3 px-4 py-3.5 focus-within:bg-white rounded-b-2xl transition-colors">
										<div className="flex flex-col items-center shrink-0">
											<div className="w-3 h-3 bg-zinc-900 border-2 border-white shoadow" />
										</div>
										<input
											onClick={() => {
												setToFill(
													"Enter drop location, either you can select or type manually",
												);
											}}
											onChange={(e) => {
												setToFill(
													"Enter drop location, either you can select or type manually",
												);
												setDrop(e.target.value);
												searchLocation(
													e.target.value,
													setDropSuggestion,
													pickUpCountry,
												);
											}}
											value={drop}
											placeholder={`${!pickUp ? "Set pickup location first" : "Drop location"}`}
											className="flex-1 bg-transparent text-sm font-semibold py-1 text-zinc-900 placeholder:text-zinc-400 outline-none disabled:cursor-not-allowed"
											disabled={isBusy || !pickUp}
										/>

										<RiSendPlaneFill
											size={14}
											className="text-zinc-700 mr-2.5"
										/>
									</div>

									<AnimatePresence>
										{dropSuggestion.length > 0 && (
											<motion.div
												initial={{
													opacity: 0,
													y: -4,
													scale: 0.98,
												}}
												animate={{
													opacity: 1,
													y: 0,
													scale: 1,
												}}
												exit={{
													opacity: 0,
													y: -4,
													scale: 0.98,
												}}
												transition={{ duration: 0.2 }}
												className="absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-200 rounded-2xl shadow-2xl max-h-40 overflow-y-auto z-50"
											>
												{dropSuggestion.map((p, i) => (
													<motion.div
														key={i}
														onClick={() => {
															setDrop(
																suggestion(p),
															);
															setDropSuggestion(
																[],
															);
															setDropLatitude(
																p.latitude!,
															);
															setDropLongitude(
																p.longitude!,
															);
														}}
														initial={{ opacity: 0 }}
														animate={{ opacity: 1 }}
														transition={{
															delay: i * 0.03,
														}}
														className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-0"
													>
														<MapPin
															size={13}
															className="text-zinc-400 shrink-0"
														/>
														<span className="text-sm text-zinc-800 font-medium truncate">
															{suggestion(p)}
														</span>
														<ChevronRight
															size={13}
															className="text-zinc-400 shrink-0 ml-auto"
														/>
													</motion.div>
												))}
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							</div>
						</motion.div>

						{/* Continue */}
						<motion.button
							initial={{ y: 16 }}
							animate={{ y: 0 }}
							className="mt-5 w-full p-3 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 flex justify-center items-center gap-3 active:scale-95 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
							disabled={
								mobile.length != 10 ||
								!name ||
								!vehicle ||
								drop.length === 0 ||
								pickUp.length === 0
							}
							onClick={() =>
								router.push(
									`/customer/search?pickup=${encodeURIComponent(pickUp)}&drop=${encodeURIComponent(drop)}&vehicle=${vehicle}&mobile=${encodeURIComponent(mobile)}&name=${encodeURIComponent(name)}&pickuplat=${pickUpLatitude}&pickuplon=${pickUpLongitude}&droplat=${dropLatitude}&droplon=${dropLongitude}`,
								)
							}
						>
							Continue <Bike size={16} />
						</motion.button>

						{/* Field indicator */}
						<div className="text-xs text-gray-400 text-center w-full -mt-4">
							{toFill}
						</div>
					</div>
				</main>
			</motion.div>
		</div>
	);
};

export default Page;
