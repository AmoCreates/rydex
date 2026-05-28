"use client";
import { RiArrowLeftLine } from "@remixicon/react";
import axios from "axios";
import { Bike, Bus, Car, Loader2, Package, Truck } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const VEHICLES = [
	{ id: "bike", label: "Bike/Scooter", icon: Bike, desc: "2 Wheeler" },
	{ id: "auto", label: "Auto", icon: Car, desc: "3 Wheeler ride" },
	{ id: "car", label: "Car", icon: Car, desc: "4 Wheeler ride" },
	{ id: "loading", label: "Loading", icon: Package, desc: "Small goods" },
	{ id: "truck", label: "Truck", icon: Truck, desc: "Heavy transport" },
	{ id: "bus", label: "Bus", icon: Bus, desc: "Passenger" },
];

const Page = () => {
	const router = useRouter();
	const [vehicleType, setVehicleType] = useState("");
	const [vehicleNumber, setVehicleNumber] = useState("");
	const [vehicleModel, setVehicleModel] = useState("");
	const [err, setErr] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		async function getDetails() {
			try {
				const res = await axios.get("/api/partner/onboarding/vehicle");
				if (res.status === 200) {
					const { type, vehicleNumber, vehicleModel } = res.data;
					setVehicleType(type);
					setVehicleNumber(vehicleNumber);
					setVehicleModel(vehicleModel);
				}
			} catch (error: any) {
				const axiosError = error;
				const serverMessage = axiosError?.response?.data?.message;
				console.log(
					"vehicle submit error",
					axiosError?.response?.data || axiosError?.message || axiosError,
				);
				setErr(serverMessage || "Something went wrong");
			}
			setIsLoading(false);
		}

		getDetails();
	}, []);

	async function handleSubmit() {
		try {
			if (vehicleType.length === 0) {
				setErr("Please select vehicle type");
				return;
			} else if (vehicleNumber.length === 0) {
				setErr("Please enter vehicle number");
				return;
			} else if (vehicleModel.length === 0) {
				setErr("Please enter vehicle model");
				return;
			} else {
				setErr(null);
			}

			setIsSubmitting(true);
			const res = await axios.post("/api/partner/onboarding/vehicle", {
				vehicleType,
				vehicleNumber,
				vehicleModel,
			});

			if (res.status === 201) {
				router.push("/partner/onboarding/documents");
			} else {
				setErr("Something went wrong");
			}
		} catch (error: any) {
			const axiosError = error;
			const serverMessage = axiosError?.response?.data?.message;
			console.log(
				"vehicle submit error",
				axiosError?.response?.data || axiosError?.message || axiosError,
			);
			setErr(serverMessage || "Something went wrong");
			} finally {
				setIsSubmitting(false);
			}
	}

	if (isLoading) {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center">
				<Loader2 className="w-8 h-8 animate-spin text-black" />
			</div>
		);
	}

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
							placeholder="AB01AB1111"
							id="vn"
							required
							minLength={9}
							maxLength={10}
							onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
							value={vehicleNumber}
							className="mt-2 w-full border-b border-gray-300 pb-2 text-sm focus:outline-none focus:border-black transition"
						/>
					</div>

					<div>
						<label htmlFor="vm" className="text-sm font-semibold text-gray-500">
							Vehicle Model
						</label>
						<input
							type="text"
							placeholder="Tata Nexon"
							style={{ textTransform: "capitalize" }}
							id="vm"
							required
							onChange={(e) => {
								setVehicleModel(e.target.value);
							}}
							value={vehicleModel}
							className="mt-2 w-full border-b border-gray-300 pb-2 text-sm focus:outline-none focus:border-black transition"
						/>
					</div>

					{err && (
						<div className="text-red-500 text-xs font-medium bg-red-50 p-3 rounded-lg border border-red-100">
							{err}
						</div>
					)}

					<button
						type="submit"
						className="mt-8 w-full h-11 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 flex justify-center items-center gap-3 active:scale-95 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
						onClick={handleSubmit}
						disabled={isSubmitting}
					>
						{isSubmitting ? (
							"Saving your details..."
						) : (
							"Continue"
						)}
					</button>
				</div>
			</motion.div>
		</div>
	);
};

export default Page;
