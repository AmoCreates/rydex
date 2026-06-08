"use client";
import { RiGroupLine, RiUserSettingsLine } from "@remixicon/react";
import axios from "axios";
import { CheckCircle2, Clock4, Truck, Video, XCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import KPI from "./KPI";
import TabButton from "./TabButton";
import { motion, AnimatePresence } from "motion/react";
import PendingList from "./PendingList";

type Stats = {
	totalPartners: number;
	totalPendingPartners: number;
	totalApprovedPartners: number;
	totalRejectedPartners: number;
	totalPendingVideoKyc: number;
	totalPendingFinalReview: number;
};

type Tab = "Video KYC" | "Partner Reviews" | "Pricing & Images";

const AdminDashboard = () => {
	const [stats, setStats] = useState<Stats | null>(null);
	const [pendingPartnerReviews, setPendingPartnerReviews] = useState<any>();
	const [pendingKyc, setPendingKyc] = useState<any>();
	const [pendingPricing, setPendingPricing] = useState<any>();
	const [activeTab, setActiveTab] = useState<Tab>("Partner Reviews");
	useEffect(() => {
		const fetchData = async () => {
			try {
				const { data } = await axios.get("/api/admin/dashboard");
				if (data) {
					setStats(data.stats);
					setPendingPartnerReviews(data.pendingPartnerReviews);
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

			<main className="max-w-7xl mx-auto space-y-16 px-6 py-10 sm:py-16 sm:p-4 ">
				<section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 px-4 sm:px-0">
					<KPI
						label="TOTAL PARTNERS"
						value={stats?.totalPartners}
						icon={<RiGroupLine size={16} />}
						desc="vs last month"
						color="bg-purple-50 text-purple-800"
						hover="hover:shadow-purple-100/60"
					/>
					<KPI
						label="APPROVED PARTNERS"
						value={stats?.totalApprovedPartners}
						icon={<CheckCircle2 size={16} />}
						desc="verified vendors"
						color="bg-blue-50 text-blue-800"
						hover="hover:shadow-blue-100/60"
					/>
					<KPI
						label="PENDING PARTNER'S REVIEWS"
						value={stats?.totalPendingPartners}
						icon={<Clock4 size={16} />}
						desc="awaiting review"
						color="bg-amber-50 text-amber-800"
						hover="hover:shadow-amber-100/60"
					/>
					<KPI
						label="REJECTED PARTNERS"
						value={stats?.totalRejectedPartners}
						icon={<XCircle size={16} />}
						desc="declined"
						color="bg-red-50 text-red-800"
						hover="hover:shadow-red-100/60"
					/>
				</section>

				<section className="bg-white rounded-2xl flex flex-wrap gap-2 px-2 py-3 overflow-hidden shadow-2xl">
					<TabButton
						icon={<RiGroupLine size={16} />}
						tag="Partner Reviews"
						active={activeTab === "Partner Reviews"}
						count={pendingPartnerReviews?.length ?? 0}
						onClick={() => setActiveTab("Partner Reviews")}
					/>
					<TabButton
						icon={<Video size={17} />}
						tag="Video KYC"
						active={activeTab === "Video KYC"}
						count={stats?.totalPendingVideoKyc ?? 0}
						onClick={() => setActiveTab("Video KYC")}
					/>
					<TabButton
						icon={<Truck size={17} />}
						tag="Pricing & Images"
						active={activeTab === "Pricing & Images"}
						count={stats?.totalPendingFinalReview ?? 0}
						onClick={() => setActiveTab("Pricing & Images")}
					/>
				</section>

				<AnimatePresence>
					<motion.div
						key={activeTab}
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						transition={{ duration: 0.2, ease: "easeOut" }}
						className="space-y-3"
					>
						{activeTab === "Partner Reviews" && (
							<PendingList list={pendingPartnerReviews ?? []} type={activeTab} />
						)}
						{activeTab === "Video KYC" && (
							<PendingList list={pendingKyc ?? []} type={activeTab} />
						)}
						{activeTab === "Pricing & Images" && (
							<PendingList list={pendingPricing ?? []} type={activeTab} />
						)}
					</motion.div>
				</AnimatePresence>
			</main>
		</div>
	);
};

export default AdminDashboard;
