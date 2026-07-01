"use client";
import React, { useState } from "react";
import { motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Map from "@/components/Map";

const Page = () => {
	const router = useRouter();
	const params = useSearchParams();

	const [pickUp, setPickUp] = useState(params.get("pickup") || "");
	const [drop, setDrop] = useState(params.get("drop") || "");
	const [distanc, setDistance] = useState(0);
	const vehicle = params.get("vehicle") || "";
	const name = params.get("name") || "";
	const mobile = Number(params.get("mobile"));
	const pickupLat = Number(params.get("pickuplat"));
	const pickupLon = Number(params.get("pickuplon"));
	const dropLat = Number(params.get("droplat"));
	const dropLon = Number(params.get("droplon"));

	return (
		<div className="min-h-screen bg-zinc-100 text-zinc-900 overflow-x-hidden">
			{/* Back button */}
			<div className="absolute top-5 left-5 z-50">
				<motion.button
					whileTap={{ scale: 0.88 }}
					onClick={() => router.back()}
					className="w-11 h-11 rounded-full bg-white border border-zinc-200 shadow-md flex items-center justify-center hover:bg-zinc-50 transition-colors cursor-pointer"
				>
					<ArrowLeft />
				</motion.button>
			</div>

			<div className="relative w-full h-[52vh] z-0">
				<Map
					pickUp={pickUp}
					drop={drop}
					setPickUpDrop={(p, d) => [setPickUp(p), setDrop(d)]}
					setDistance={(d) => setDistance(d)}
				/>
			</div>
		</div>
	);
};

export default Page;
