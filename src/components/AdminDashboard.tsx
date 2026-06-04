"use client";
import { RiGroupLine, RiUserSettingsLine } from "@remixicon/react";
import axios from "axios";
import { CheckCircle2, Clock4, XCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import KPI from "./KPI";

type Stats = {
	totalPartners: number;
	totalPendingPartners: number;
	totalApprovedPartners: number;
	totalRejectedPartners: number;
};

const AdminDashboard = () => {
	const [stats, setStats] = useState<Stats | null>(null);
	useEffect(() => {
		const fetchData = async () => {
			try {
				const { data } = await axios.get("/api/admin/dashboard");
				console.log(data);

				if (data) {
					setStats(data.stats);
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

			<main className="max-w-7xl mx-auto space-y-16 px-6 py-12  sm:p-4 ">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 px-4 sm:px-0">
					<KPI label="TOTAL VENDORS" value={stats?.totalPartners} icon={<RiGroupLine size={16}/>} desc="vs last month" color="bg-purple-50 text-purple-800" hover="hover:shadow-purple-100/60"
					/>
					<KPI label="APPROVED" value={stats?.totalApprovedPartners} icon={<CheckCircle2 size={16}/>} desc="verified vendors" color="bg-blue-50 text-blue-800" hover="hover:shadow-blue-100/60"
					/>
					<KPI label="PENDING" value={stats?.totalPendingPartners} icon={<Clock4 size={16}/>} desc="awaiting review" color="bg-amber-50 text-amber-800" hover="hover:shadow-amber-100/60"
					/>
					<KPI label="REJECTED" value={stats?.totalRejectedPartners} icon={<XCircle size={16}/>} desc="declined" color="bg-red-50 text-red-800" hover="hover:shadow-red-100/60"
					/>
				</div>
			</main>
		</div>
	);
};

export default AdminDashboard;
