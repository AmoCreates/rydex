"use client";
import { IVehicle } from "@/model/vehicle.model";
import React from "react";
import { motion } from "motion/react";

const VehicleCard = ({
	vehicle,
	distance,
}: {
	vehicle: IVehicle;
	distance: number;
}) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			whileHover={{ y: -6 }}
			transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
			className="relative bg-white border border-zinc-200 rounded-3xl overflow-hidden flex flex-col group cursor-default"
			style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
		>
			<div className="relative h-48 bg-zinc-50 flex items-center justify-center overflow-hidden">
				<div
					className="absolute inset-0 opacity-[0.04]"
					style={{
						backgroundImage:
							"linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
						backgroundSize: "24px 24px",
					}}
				/>

				<motion.img
					src={vehicle.imageUrl}
					alt={vehicle.vehicleModel}
					className="relative z-10 h-full w-full object-contain mix-blend-multiply"
					style={{
						filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.14))",
					}}
					whileHover={{
						scale: 1.06,
						filter: "drop-shadow(0 12px 32px rgba(0,0,0,0.22))",
					}}
					transition={{ duration: 0.35 }}
				/>
			</div>
		</motion.div>
	);
};

export default VehicleCard;
