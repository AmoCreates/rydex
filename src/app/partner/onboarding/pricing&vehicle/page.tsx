"use client";
import React, { useState, useRef } from "react";
import { RiArrowLeftLine, RiImageAddLine } from "@remixicon/react";
import {
	Car,
	Snowflake,
	Gauge,
	Banknote,
	Clock,
	ArrowRight,
	Info,
} from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type condition = "good" | "fair" | "poor";

const Page = () => {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		AC: false,
		vehicleCondition: "good" as condition,
		baseFare: 0,
		pricePerKm: 0,
		waitingChargerPerMin: 0,
	});
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// 3. Simplified Image Capture logic
	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setImageFile(file); // Save the raw binary file to send to route.ts later
			setImagePreview(URL.createObjectURL(file)); // Create a fast, lightweight preview URL for the screen
		}
	};

	const handleSubmit = async () => {
		try {
			setIsLoading(true);
			await new Promise((resolve) => setTimeout(resolve, 3000));
			setIsLoading(false);
			console.log("done");
		} catch (error) {
			console.log(error);
		} 
	};

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="relative w-full max-w-2xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-[0_25px_70px_rgba(0,0,0,0.08)] overflow-hidden"
			>
				{/* Back Button */}
				<button
					onClick={() => router.back()}
					className="absolute cursor-pointer left-8 top-8 z-10 p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all group"
				>
					<RiArrowLeftLine className="w-5 h-5 text-gray-600 group-hover:-translate-x-1 transition-transform" />
				</button>

				<div className="p-6 sm:px-10 sm:py-8">
					<div className="mb-8 text-center">
						<h1 className="text-3xl font-black text-gray-900 tracking-tight">
							Pricing & Vehicle Image
						</h1>
						<p className="text-gray-500 mt-2 font-medium">
							Configure your vehicle service details
						</p>
					</div>

					<div className="space-y-8">
						{/* Vehicle Image Upload Section */}
						<div className="space-y-4">
							<label className="flex items-center gap-2 text-sm font-bold text-gray-800 uppercase tracking-widest">
								<Car className="w-4 h-4 text-orange-500" />
								Vehicle Image
							</label>
							<div
								onClick={() => fileInputRef.current?.click()}
								className="relative aspect-video rounded-3xl border-2 border-dashed border-gray-200 hover:border-black transition-all cursor-pointer flex flex-col items-center justify-center bg-gray-50 group overflow-hidden"
							>
								{imagePreview ? (
									<>
										<Image
											src={imagePreview}
											alt="Vehicle preview"
											fill
											className="object-cover"
										/>
										<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
											<span className="text-white font-bold bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl">
												Change Photo
											</span>
										</div>
									</>
								) : (
									<div className="text-center p-6">
										<div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
											<RiImageAddLine className="w-8 h-8 text-gray-400" />
										</div>
										<p className="font-bold text-gray-700">
											Click to upload photo
										</p>
										<p className="text-xs text-gray-400 mt-1 font-medium">
											Clear side-view photo required
										</p>
									</div>
								)}
							</div>
							<input
								type="file"
								ref={fileInputRef}
								onChange={handleImageChange}
								accept="image/*"
								className="hidden"
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* AC Availability Toggle */}
							<div className="space-y-4">
								<label className="flex items-center gap-2 text-sm font-bold text-gray-800 uppercase tracking-widest">
									<Snowflake className="w-4 h-4 text-blue-500" />
									AC Availability
								</label>
								<button
									type="button"
									onClick={() => {
										setFormData({
											...formData,
											AC: !formData.AC,
										});
									}}
									className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all ${
										formData.AC
											? "border-black bg-black text-white"
											: "border-gray-100 bg-gray-50 text-gray-600"
									}`}
								>
									<span className="font-bold">Air Conditioning</span>
									<div
										className={`w-12 h-6 rounded-full relative ${formData.AC ? "bg-white/20" : "bg-gray-200"}`}
									>
										<div
											className={`absolute top-1 w-4 h-4 rounded-full transition-all ${formData.AC ? "right-1 bg-white" : "left-1 bg-gray-400"}`}
										/>
									</div>
								</button>
							</div>

							{/* Vehicle Condition Selector */}
							<div className="space-y-4">
								<label className="flex items-center gap-2 text-sm font-bold text-gray-800 uppercase tracking-widest">
									<Gauge className="w-4 h-4 text-emerald-500" />
									Condition
								</label>
								<div className="flex p-1.5 bg-gray-100 rounded-2xl h-15">
									{["good", "fair", "poor"].map((c) => (
										<button
											key={c}
											type="button"
											onClick={() =>
												setFormData({
													...formData,
													vehicleCondition: c as condition,
												})
											}
											className={`flex-1 rounded-xl text-xs font-black uppercase tracking-tighter transition-all cursor-pointer ${
												formData.vehicleCondition === c
													? "bg-black text-white shadow-md scale-[1.02]"
													: "text-gray-400 hover:text-gray-600"
											}`}
										>
											{c}
										</button>
									))}
								</div>
							</div>
						</div>

						{/* Pricing Details Section */}
						<div className="pt-6 border-t border-gray-100 space-y-6">
							<div className="flex items-center justify-between">
								<h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
									<Banknote className="w-6 h-6 text-indigo-500" />
									Pricing Structure
								</h3>
								<Info className="w-5 h-5 text-gray-300" />
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
								{[
									{ label: "Base Fare", key: "baseFare", icon: Banknote },
									{ label: "Price / KM", key: "pricePerKm", icon: Car },
									{
										label: "Wait / Min",
										key: "waitingChargerPerMin",
										icon: Clock,
									},
								].map((item) => (
									<div
										key={item.key}
										className="px-5 py-4 bg-gray-50 rounded-2xl border border-transparent focus-within:border-black focus-within:bg-white transition-all space-y-1"
									>
										<label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
											{item.label}
										</label>
										<div className="flex items-center gap-1">
											<span className="text-lg font-black text-gray-400">
												₹
											</span>
											<input
												type="number"
												value={formData[item.key]}
												onChange={(e) =>
													setFormData({
														...formData,
														[item.key]: e.target.value,
													})
												}
												className="w-full bg-transparent font-black text-xl outline-none placeholder:text-gray-200"
												placeholder="0"
											/>
										</div>
									</div>
								))}
							</div>
						</div>

						<button
							type="submit"
							disabled={isLoading}
							className="w-full bg-black text-white p-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-gray-900 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-xl shadow-black/10"
							onClick={handleSubmit}
						>
							{isLoading ? (
								<div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
							) : (
								<>
									Save Vehicle Details
									<ArrowRight className="w-6 h-6" />
								</>
							)}
						</button>
					</div>
				</div>
			</motion.div>
		</div>
	);
};

export default Page;
