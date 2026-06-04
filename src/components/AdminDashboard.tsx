"use client";
import { RiGroupLine, RiUserSettingsLine } from "@remixicon/react";
import axios from "axios";
import { CircleCheck, CircleX, Clock4, TrendingUp } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const AdminDashboard = () => {
	const [totalVendors, setTotalVendors] = useState(0);
	const [approved, setVendors] = useState(0);
	const [pending, setPending] = useState(0);
	const [rejected, setRejected] = useState(0);
	const ANALYSIS = [
		{
			label: "TOTAL VENDORS",
			percentage: "",
			icon: RiGroupLine,
			desc: "vs last month",
			count: totalVendors,
			color: "bg-purple-50 text-purple-500",
		},
		{
			label: "APPROVED",
			percentage: "",
			icon: CircleCheck,
			desc: "verified vendors",
			count: approved,
			color: "bg-blue-50 text-blue-500",
		},
		{
			label: "PENDING",
			percentage: "",
			icon: Clock4,
			desc: "awaiting review",
			count: pending,
			color: "bg-yellow-50 text-yellow-500",
		},
		{
			label: "REJECTED",
			percentage: "",
			icon: CircleX,
			desc: "declined",
			count: rejected,
			color: "bg-red-50 text-red-500",
		},
	];
	useEffect(() => {
		const fetchData = async () => {
			try {
				const { data } = await axios.get("/api/admin/dashboard");
				console.log(data);
				const {
					totalPartners,
					totalPendingPartners,
					totalRejectedPartners,
					totalApprovedPartners,
				} = data;

				if (data) {
					setTotalVendors(totalPartners || 0);
					setVendors(totalApprovedPartners || 0);
					setPending(totalPendingPartners || 0);
					setRejected(totalRejectedPartners || 0);
				}
			} catch (error) {
				console.log(error);
			}
		};

		fetchData();
	}, []);

	return (
		<div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200">
			<div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b z-40">
				<div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Image
							src="/logo.png"
							width={44}
							height={44}
							alt="logo"
							priority
							className="w-auto h-auto"
						/>
					</div>
					<div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-black text-white ">
						<RiUserSettingsLine size={17} />
						Admin Dashboard
					</div>
				</div>
			</div>

		<div className="mx-auto space-y-16 py-16 max-w-7xl sm:p-4 md:p-6">
			
		
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 px-4 sm:px-0">
				{ANALYSIS.map((anaylis) => (
					<div
						key={anaylis.label}
						className="bg-white rounded-xl text-gray-400 p-4 flex flex-col gap-4"
					>
						<div className="flex justify-between items-start">
							<div
								className={`flex items-center justify-center h-10 w-10 ${anaylis.color} rounded-xl`}
							>
								<anaylis.icon size={20} />
							</div>
							<div className="flex items-center gap-1 bg-green-50 text-green-900 font-semibold text-xs rounded-full py-1 px-2">
								<TrendingUp size={12} />
								+12%
							</div>
						</div>

						<p className=" text-sm font-semibold">{anaylis.label}</p>
						<h1 className="text-black font-bold text-3xl -mt-2">
							{anaylis.count}
						</h1>

						<div className="flex justify-between items-center border-gray-200 border-t pt-3">
							<p className="text-sm">{anaylis.desc}</p>
							<Clock4 size={14} />
						</div>
					</div>
				))}
			</div>
			</div>
		</div>
	);
};

export default AdminDashboard;
