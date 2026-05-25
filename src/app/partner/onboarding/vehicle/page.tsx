"use client";
import { RiArrowLeftLine } from "@remixicon/react";
import { Bike, Bus, Car, Package, Truck } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const VEHICLES = [
	{ id: "bike", label: "Bike", icon: Bike, desc: "2 Wheeler" },
	{ id: "auto", label: "Auto", icon: Car, desc: "3 Wheeler ride" },
	{ id: "car", label: "Car", icon: Car, desc: "4 Wheeler ride" },
	{ id: "loading", label: "Loading", icon: Package, desc: "Small goods" },
	{ id: "truck", label: "Truck", icon: Truck, desc: "Heavy transport" },
	{ id: "bus", label: "Bus", icon: Bus, desc: "Passenger" },
];

const Page = () => {
	const router = useRouter();
	const [vehicleType, setVehicleType] = useState<string | null>(null);
	return (
		<div className="min-h-screen bg-white flex items-center justify-center px-4">
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="w-full max-w-xl bg-white rounded-3xl border border-gray-200 shadow-[0_25px_70px_rgba(0,0,0,0.15)] p-6 sm:p-8"
			>
				<div className="relative text-center">
					<button
						className="absolute left-0 top-0 w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-all cursor-pointer"
						onClick={() => router.back()}
					>
						<RiArrowLeftLine />
					</button>

					<p className="text-xs text-gray-500 font-medium">step 1 of 3</p>
					<h1 className="text-2xl font-bold mt-1">Vehicle Details</h1>
					<p className="text-sm text-gray-500 mt-2 ">
						Add your vehicle information
					</p>
				</div>

				<div className="mt-8 space-y-6">
					<div>
						<p className="text-xs font-semibold text-gray-500 mb-3">
							Vehicle Type
						</p>
						<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
							{VEHICLES.map((v, i) => {
								const Icon = v.icon;
								const isActive = vehicleType === v.id;
								return (
									<motion.div
										key={i}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.96 }}
										onClick={() => setVehicleType(v.id)}
										className={` rounded-2xl border p-4 flex flex-col items-center gap-2 transition cursor-pointer ${isActive ? "bg-black text-white border-black" : "border-gray-200 hover:border-black"}`}
									>
										<div
											className={`w-11 h-11 rounded-full flex items-center justify-center ${isActive ? "bg-white text-black" : "bg-black text-white"}`}
										>
											<Icon />
										</div>

										<div className="text-sm font-semibold">{v.label}</div>
										<p
											className={`text-xs ${isActive ? "text-gray-300" : "text-gray-500"} `}
										>
											{v.desc}
										</p>
									</motion.div>
								);
							})}
						</div>
					</div>

					<div>
						<label htmlFor="vn" className="text-sm font-semibold text-gray-500">
							Vehicle Number
						</label>
						<input
							type="text"
							placeholder="eg. UP251111"
							id="vn"
							minLength={9}
							maxLength={11}
							className="mt-2 w-full border-b border-gray-300 pb-2 text-sm focus:outline-none focus:border-black transition"
						/>
					</div>

					<div>
						<label htmlFor="vm" className="text-sm font-semibold text-gray-500">
							Vehicle Model
						</label>
						<input
							type="text"
							placeholder="eg. Tata Nexon"
							id="vm"
							className="mt-2 w-full border-b border-gray-300 pb-2 text-sm focus:outline-none focus:border-black transition"
						/>
					</div>

					<button
						type="submit"
						className="mt-8 w-full h-11 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 flex justify-center items-center gap-3 active:scale-95 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
						onClick={() => router.push("/partner/onboarding/documents")}
					>
						Continue
					</button>
				</div>
			</motion.div>
		</div>
	);
};

export default Page;
