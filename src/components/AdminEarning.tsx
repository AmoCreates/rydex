"use client";
import axios from "axios";
import { BarChart2, Star, Zap } from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";

type Earning = {
	date: string;
	earning: number;
};

const AdminEarning = () => {
	const [earnings, setEarnings] = useState<Earning[]>([]);
	useEffect(() => {
		const fetchEarning = async () => {
			try {
				const { data } = await axios.get("/api/admin/earning");
				console.log(data);
			const earningsData: Earning[] = Array.isArray(data) ? data.slice(-7) : [];
			setEarnings(earningsData);
		} catch (error: any) {
			console.log(error?.response?.data?.message || error?.message || error);
		}
	};

	fetchEarning();
}, []);

const total = earnings.reduce(
	(prevVal, currIdx) => prevVal + (currIdx?.earning ?? 0),
	0,
);
const avg = earnings.length ? Math.round(total / earnings.length) : 0;
const max = earnings.length
	? Math.max(...earnings.map((d) => d?.earning ?? 0))
	: 0;
const bestDay = earnings.find((d) => d?.earning === max);
const today = earnings[earnings.length - 1];
const yesterday = earnings[earnings.length - 2];
const delta = today && yesterday ? (today.earning ?? 0) - (yesterday.earning ?? 0) : 0;
const deltaPositive = delta >= 0;
const percentage = yesterday
	? Math.abs(Math.round((delta / (yesterday.earning ?? 1)) * 100))
	: 0;

function fmt(n?: number | null) {
	if (typeof n !== "number" || Number.isNaN(n)) return "₹0";
	return "₹" + n.toLocaleString("en-IN");
}
	
  const metrics = [
		{
			label: "Best Day",
			value: fmt(max),
			sub: bestDay?.date ?? "—",
			icon: <Star size={14} />,
			color: "text-violet-600",
			bg: "bg-violet-50",
		},
		{
			label: "Daily Avg",
			value: fmt(avg),
			sub: "per day",
			icon: <BarChart2 size={14} />,
			color: "text-blue-600",
			bg: "bg-blue-50",
		},
		{
			label: "Today",
			value: today ? fmt(today.earning) : "—",
			sub:
				today && yesterday
					? `${deltaPositive ? "+" : ""}${fmt(delta)} vs yesterday`
					: "—",
			icon: <Zap size={14} />,
			color: "text-emerald-600",
			bg: "bg-emerald-50",
		},
	];

	return (
		<div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 w-full">
			<div className="flex items-start justify-between mb-6 flex-wrap gap-4">
				<div>
					<span className="inline-block text-[11px] font-semibold tracking-widest uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-2">
						Admin Dashboard
					</span>
					<h2 className="text-xl font-bold text-gray-900 tracking-tight">
						Daily Earnings
					</h2>
					<p className="text-sm text-gray-400 mt-0.5">
						Last 7 days performance
					</p>
				</div>
				<div className="text-right">
					<p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
						Weeky Total
					</p>
          <motion.div
          key={total}
          initial={{opacity: 0, y: 6}}
          animate={{opacity: 1, y: 0}}
          className="text-3xl font-bold text-gray-900 font-mono tracking-tight"
          >
            {fmt(total)}
          </motion.div>
				</div>
			</div>
		</div>
	);
};

export default AdminEarning;
