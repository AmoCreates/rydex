"use client";
import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";

const Page = () => {
	const [vehicle, setVehicle] = useState<string>("Bike");
	const [mobile, setMobile] = useState<number | null>(null);
	const [pickUp, setPickUp] = useState("");
	const [drop, setDrop] = useState("");
  const [step, setStep] = useState(0);
  const progress = [!!vehicle, !!mobile, !!pickUp, !!drop].filter(Boolean).length

	return (
		<div className="min-h-screen  bg-zinc-100 flex items-center justify-center px-4 py-10">
			<motion.div
				initial={{ opacity: 0, y: 32 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
				className="w-full max-w-md"
			>
				<header className="flex items-center gap-4 mb-6 px-1">
					<motion.button
						whileTap={{ scale: 0.88 }}
						className="w-11 h-11 rounded-2xl bg-white border-zinc-200 shadow-sm flex items-center justify-center hover:bg-zinc-50 transition-colors shrink-0"
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
				</header>
			</motion.div>
		</div>
	);
};

export default Page;
