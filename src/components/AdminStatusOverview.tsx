import React from "react";
import { motion } from "framer-motion"; // or "motion/react"
import { CheckCircle2, Clock4, XCircle } from "lucide-react";

interface AdminStatusOverviewProps {
	approved: number;
	pending: number;
	rejected: number;
}

const AdminStatusOverview = ({
	approved = 0,
	pending = 0,
	rejected = 0,
}: AdminStatusOverviewProps) => {
	const rawTotal = approved + pending + rejected;
	const total = rawTotal || 1; // Prevent division by zero

	const approvePer = Math.round((approved / total) * 100);
	const pendingPer = Math.round((pending / total) * 100);
	const rejectedPer = Math.round((rejected / total) * 100);

	// Donut Chart Math (SVG Circle calculations)
	const radius = 42;
	const circumference = 2 * Math.PI * radius; // ≈ 263.89

	const strokeApproved = (approvePer / 100) * circumference;
	const strokePending = (pendingPer / 100) * circumference;
	const strokeRejected = (rejectedPer / 100) * circumference;

	// Rotational offsets to stack the donut slices correctly
	const pendingOffset = strokeApproved;
	const rejectedOffset = strokeApproved + strokePending;

	return (
		<div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 w-full">
			{/* Header */}
			<div className="mb-6">
				<span className="inline-block text-[10px] font-bold tracking-widest uppercase text-indigo-600 bg-indigo-50/60 px-3 py-1 rounded-full mb-1">
					Applications
				</span>
				<h2 className="text-xl font-bold text-gray-900 tracking-tight">
					Status Overview
				</h2>
				<p className="text-xs text-gray-400 mt-0.5">
					{rawTotal} total applications
				</p>
			</div>

			{/* Content Grid: Left Circle + Right Bars */}
			<div className="flex flex-col md:flex-row items-center gap-8">
				{/* BIG CIRCLE DONUT CHART */}
				<div className="relative w-36 h-36 flex items-center justify-center shrink-0">
					<svg
						className="w-full h-full -rotate-90"
						viewBox="0 0 100 100"
					>
						{/* Background Circle */}
						<circle
							cx="50"
							cy="50"
							r={radius}
							className="stroke-gray-100"
							strokeWidth="15"
							fill="transparent"
						/>

						{/* Approved Arc (Green) */}
						{approvePer > 0 && (
							<motion.circle
								cx="50"
								cy="50"
								r={radius}
								className="stroke-emerald-500"
								strokeWidth="15"
								fill="transparent"
								strokeDasharray={`${strokeApproved} ${circumference}`}
								strokeDashoffset={0}
								strokeLinecap="round"
								initial={{
									strokeDasharray: `0 ${circumference}`,
								}}
								animate={{
									strokeDasharray: `${strokeApproved} ${circumference}`,
								}}
								transition={{ duration: 1, ease: "easeOut" }}
							/>
						)}

						{/* Pending Arc (Amber) */}
						{pendingPer > 0 && (
							<motion.circle
								cx="50"
								cy="50"
								r={radius}
								className="stroke-amber-400"
								strokeWidth="15"
								fill="transparent"
								strokeDasharray={`${strokePending} ${circumference}`}
								strokeDashoffset={-pendingOffset}
								strokeLinecap="round"
								initial={{
									strokeDasharray: `0 ${circumference}`,
								}}
								animate={{
									strokeDasharray: `${strokePending} ${circumference}`,
								}}
								transition={{
									duration: 1,
									ease: "easeOut",
									delay: 0.2,
								}}
							/>
						)}

						{/* Rejected Arc (Red) */}
						{rejectedPer > 0 && (
							<motion.circle
								cx="50"
								cy="50"
								r={radius}
								className="stroke-rose-500"
								strokeWidth="15"
								fill="transparent"
								strokeDasharray={`${strokeRejected} ${circumference}`}
								strokeDashoffset={-rejectedOffset}
								strokeLinecap="round"
								initial={{
									strokeDasharray: `0 ${circumference}`,
								}}
								animate={{
									strokeDasharray: `${strokeRejected} ${circumference}`,
								}}
								transition={{
									duration: 1,
									ease: "easeOut",
									delay: 0.4,
								}}
							/>
						)}
					</svg>

					{/* Center Text */}
					<div className="absolute inset-0 flex flex-col items-center justify-center text-center">
						<span className="text-2xl font-bold text-gray-800 leading-none">
							{rawTotal}
						</span>
						<span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mt-1">
							Total
						</span>
					</div>
				</div>

				{/* RIGHT HAND STATUS BARS */}
				<div className="flex-1 w-full flex flex-col gap-5">
					{/* Approved */}
					<div className="flex items-center gap-3">
						<div className="flex items-center justify-center h-9 w-9 bg-emerald-50 rounded-xl shrink-0">
							<CheckCircle2
								size={15}
								className="text-emerald-600"
							/>
						</div>

						<div className="flex-1 flex flex-col gap-1.5">
							<div className="flex justify-between items-center text-xs font-semibold">
								<span className="text-emerald-700">
									Approved
								</span>
							</div>

							<div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
								<motion.div
									initial={{ width: 0 }}
									animate={{ width: `${approvePer}%` }}
									transition={{
										duration: 1,
										ease: "easeOut",
									}}
									className="bg-emerald-500 h-full rounded-full"
								/>
							</div>
						</div>

						<div className="text-right flex flex-col min-w-6">
							<span className="text-gray-800 font-bold">
								{approved}
							</span>
							<span className="text-[10px] text-gray-400">
								{approvePer}%
							</span>
						</div>
					</div>

					{/* Pending */}
					<div className="flex items-center gap-3">
						<div className="flex items-center justify-center h-9 w-9 bg-amber-50 rounded-xl shrink-0">
							<Clock4 size={15} className="text-amber-600" />
						</div>

						<div className="flex-1 flex flex-col gap-1.5">
							<div className="flex justify-between items-center text-xs font-semibold">
								<span className="text-amber-700">Pending</span>
							</div>

							<div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
								<motion.div
									initial={{ width: 0 }}
									animate={{ width: `${pendingPer}%` }}
									transition={{
										duration: 1,
										ease: "easeOut",
										delay: 0.1,
									}}
									className="bg-amber-400 h-full rounded-full"
								/>
							</div>
						</div>

						<div className="text-right flex flex-col min-w-6">
							<span className="text-gray-800 font-bold">
								{pending}
							</span>
							<span className="text-[10px] text-gray-400">
								{pendingPer}%
							</span>
						</div>
					</div>

					{/* Rejected */}
					<div className="flex items-center gap-3">
						<div className="flex items-center justify-center h-7 w-7 bg-rose-50 rounded-full shrink-0">
							<XCircle size={15} className="text-rose-600" />
						</div>

						<div className="flex-1 flex flex-col gap-1.5">
							<div className="flex justify-between items-center text-xs font-semibold">
								<span className="text-rose-700">Rejected</span>
							</div>

							<div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
								<motion.div
									initial={{ width: 0 }}
									animate={{ width: `${rejectedPer}%` }}
									transition={{
										duration: 1,
										ease: "easeOut",
										delay: 0.2,
									}}
									className="bg-rose-500 h-full rounded-full"
								/>
							</div>
						</div>

						<div className="text-right flex flex-col min-w-6">
							<span className="text-gray-800 font-bold">
								{rejected}
							</span>
							<span className="text-[10px] text-gray-400">
								{rejectedPer}%
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminStatusOverview;
