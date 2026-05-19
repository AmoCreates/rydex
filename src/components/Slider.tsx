"use client";
import { RiBikeLine } from "@remixicon/react";
import {
	Bus,
	Car,
	CarTaxiFront,
	ChevronLeft,
	ChevronRight,
	Sparkles,
	Truck,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const VEHICLE_CATEGORIES = [
	{
		title: "All Vehicles",
		desc: "Browse the full fleet",
		Icon: RiBikeLine,
		tag: "Popular",
	},
	{
		title: "Bikes",
		desc: "Fast & affordable rides",
		Icon: RiBikeLine,
		tag: "Quick",
	},
	{
		title: "Cars",
		desc: "Comfortable city travel",
		Icon: Car,
		tag: "Comfort",
	},
	{
		title: "SUVs",
		desc: "Premium & spacious",
		Icon: Car,
		tag: "Premium",
	},
	{
		title: "Vans",
		desc: "Family & group transport",
		Icon: Bus,
		tag: "Family",
	},
	{
		title: "Trucks",
		desc: "Heavy & commercial transport",
		Icon: Truck,
		tag: "Cargo",
	},
];

const allIcon = [RiBikeLine, Car, Car, Bus, Truck];

const Slider = () => {
	const [hovered, setHovered] = useState<number | null>(null);
	return (
		<div className="w-full bg-white py-20 px-4 overflow-hidden ">
			<div className="max-w-7xl mx-auto px-4  ">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
					className="flex items-end justify-between mb-10"
				>
					<div>
						<div className="flex items-center gap-2 mb-3">
							<div className="h-px w-8 bg-zinc-900" />
							<span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
								Fleet
							</span>
						</div>
						<h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900">
							Vehicles <br />{" "}
							<span className="relative inline-block">
								Categories
								<motion.div
									initial={{ scaleX: 0 }}
									whileInView={{ scaleX: 1 }}
									transition={{
										duration: 0.6,
										delay: 0.4,
										ease: [0.22, 1, 0.36, 1],
									}}
									className="absolute -bottom-1 left-0 right-0 h-0.5 bg-zinc-900 origin-left"
								/>
							</span>
						</h2>
						<p className="text-zinc-400 text-sm mt-3 font-medium">
							Choose the ride that fits your journey
						</p>
					</div>
					<div className="hidden sm:flex items-center gap-2">
						<motion.div
							whileTap={{ scale: 0.88 }}
							className="w-11 h-11 rounded-xl border border-zinc-200 bg-white flex items-center justify-center hover:bg-zinc-900 hover:border-zinc-900 hover:text-white disabled:opacity-25 disabled:hover:bg-white disabled:hover:text-zinc-900 disabled:hover:border-zinc-200 transition-all text-zinc-700 shadow-sm cursor-pointer"
						>
							<ChevronLeft size={18} strokeWidth={2.5} />
						</motion.div>
						<motion.div
							whileTap={{ scale: 0.88 }}
							className="w-11 h-11 rounded-xl border border-zinc-200 bg-white flex items-center justify-center hover:bg-zinc-900 hover:border-zinc-900 hover:text-white disabled:opacity-25 disabled:hover:bg-white disabled:hover:text-zinc-900 disabled:hover:border-zinc-200 transition-all text-zinc-700 shadow-sm cursor-pointer"
						>
							<ChevronRight size={18} strokeWidth={2.5} />
						</motion.div>
					</div>
				</motion.div>
				<div className="relative">
					<div
						className="flex gap-5 pt-20 overflow-x-auto scroll-smooth pb-4 px-1"
						style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
					>
						{VEHICLE_CATEGORIES.map((category, idx) => {
							const isHovered = hovered === idx;
							return (
								<motion.div
									key={idx}
									initial={{ opacity: 0, y: 28 }}
									whileInView={{ opacity: 1, y: 0 }}
									transition={{
										delay: 0.1 + idx * 0.08,
										duration: 0.5,
										ease: [0.22, 1, 0.36, 1],
									}}
									onHoverStart={() => setHovered(idx)}
									onHoverEnd={() => setHovered(null)}
									whileHover={{ y: -8 }}
									className="group relative min-w-55 sm:min-w-65 shrink-0 cursor-pointer"
								>
									<motion.div
										animate={{
											backgroundColor: isHovered ? "#09090b" : "#ffffff",
											borderColor: isHovered ? "#09090b" : "#e4e4e7",
											boxShadow: isHovered
												? "0 24px 56px rgba(0, 0, 0, 0.2)"
												: "0 2px 16px rgba(0, 0, 0, 0.1)",
										}}
										transition={{ duration: 0.25 }}
										className="relative rounded-3xl border p-6 sm:p-7 overflow-hidden h-full"
									>
										<motion.div
											animate={{
												backgroundColor: isHovered
													? "rgba(255, 255, 255, 0.12)"
													: "#f4f4f5",
												color: isHovered ? "#ffffff" : "#71717a",
												borderColor: isHovered
													? "rgba(255, 255, 255, 0.15)"
													: "#e4e4e7",
											}}
											className="inline-flex items-center gap-1.5 border text-[9px] font-black uppercase tracking-[0.18em] px-2.5 py-1.5 rounded-full mb-5 transition-colors"
										>
											<Sparkles size={8} />
											{category.tag}
										</motion.div>

										{idx === 0 ? (
											<div className="flex -space-x-3 mb-5">
												{allIcon.map((Icon, i) => {
													return (
														<motion.div
															key={i}
															animate={{
																backgroundColor: isHovered
																	? "#18181b"
																	: "#f4f4f5",
																borderColor: isHovered
																	? "rgba(255, 255, 255, 0.15)"
																	: "#e4e4e7",
															}}
															className="w-14 h-14 rounded-xl border flex items-center justify-center transition-colors shadow-sm"
														>
															<motion.div
																animate={{
																	color: isHovered ? "#ffffff" : "#3f3f46",
																}}
																transition={{ duration: 0.25 }}
															>
																<Icon size={24} strokeWidth={1.4} />
															</motion.div>
														</motion.div>
													);
												})}
											</div>
										) : (
											<motion.div
												animate={{
													backgroundColor: isHovered
														? "rgba(255, 255, 255, 0.1)"
														: "#f4f4f5",
													borderColor: isHovered
														? "rgba(255, 255, 255, 0.15)"
														: "#e4e4e7",
												}}
												className="w-14 h-14 rounded-2xl border flex items-center justify-center mb-5 transition-colors"
											>
												<motion.div
													animate={{ color: isHovered ? "#ffffff" : "#3f3f46" }}
													transition={{ duration: 0.25 }}
												>
													<category.Icon size={24} strokeWidth={1.4} />
												</motion.div>
											</motion.div>
										)}

										<motion.h3
											animate={{ color: isHovered ? "#ffffff" : "#09090b" }}
											transition={{ duration: 0.25 }}
											className="text-lg font-black tracking-tight leading-none mb-2"
										>
											{category.title}
										</motion.h3>
									</motion.div>
								</motion.div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Slider;
