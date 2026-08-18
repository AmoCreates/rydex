"use client";
import { RiGroupLine, RiUserSettingsLine } from "@remixicon/react";
import axios from "axios";
import {
	CheckCircle2,
	Clock4,
	LogOut,
	Truck,
	Video,
	XCircle,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import KPI from "./KPI";
import TabButton from "./TabButton";
import { motion, AnimatePresence } from "motion/react";
import PendingList from "./PendingList";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/Toolkit/store";
import Link from "next/link";
import { signOut } from "next-auth/react";
import AdminEarning from "./AdminEarning";
import AdminStatusOverview from "./AdminStatusOverview";
import { IUser } from "@/model/user.model";
import ApiErrorBanner from "./ApiErrorBanner";

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
	const [totalPendingPartnerReviews, setTotalPendingPartnerReviews] =
		useState<IUser[]>([]);
	const [pendingKyc, setPendingKyc] = useState<IUser[]>([]);
	const [pendingPricing, setPendingPricing] = useState<IUser[]>([]);
	const [activeTab, setActiveTab] = useState<Tab>("Partner Reviews");
	const [profileOpen, setProfileOpen] = useState(false);
	const [errMsg, setErrMsg] = useState("");
	const { userData } = useSelector((state: RootState) => state.user);
	const dispatch = useDispatch<AppDispatch>();

	useEffect(() => {
		const fetchData = async () => {
			try {
				setErrMsg("");
				const { data } = await axios.get("/api/admin/dashboard");
				if (data.success) {
					setErrMsg("");
					setStats(data.stats);
					setPendingKyc(data.pendingVideoKyc);
					setPendingPricing(data.pendingPricing);
					setTotalPendingPartnerReviews(data.pendingPartnerReviews);
				}
			} catch (error: unknown) {
				const axiosError = error as {
					response?: {
						data?: {
							message?: string;
						};
					};
					message?: string;
				};
				const serverMessage = axiosError?.response?.data?.message;
				setErrMsg(
					serverMessage ||
						"failed to fetch data, please refresh the page and try again",
				);
			}
		};

		fetchData();
	}, []);

	const handleSignOut = async () => {
		await signOut({ callbackUrl: "/", redirect: false });
		dispatch({ type: "user/setUserData", payload: null });
		setProfileOpen(false);
	};

	return (
		<div className="relative min-h-screen bg-linear-to-br from-gray-100 to-gray-200">
			<div className=" absolute top-7 left-1/2 -translate-x-1/2 z-[9999]">
				<ApiErrorBanner message={errMsg} />
			</div>
			<header className="sticky top-0 bg-white/80 backdrop-blur-lg border-b z-40">
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

					<div className="relative">
						<div
							className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-black text-white cursor-pointer"
							onClick={() => {
								setProfileOpen(!profileOpen);
							}}
						>
							<RiUserSettingsLine size={17} />
							Admin Dashboard
						</div>
						<AnimatePresence>
							{profileOpen && (
								<motion.div
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.95 }}
									className="absolute hidden md:block right-0 top-14 w-75 bg-white text-black rounded-lg shadow-xl py-2 px-2 z-50 border border-gray-200"
								>
									<div className="py-2 text-center border-b border-gray-200 mb-1">
										<p className="text-lg font-semibold">
											{userData?.name}
										</p>
										<p className="text-xs -mt-1 text-gray-500">
											{userData?.role}
										</p>
									</div>
									<Link
										href="/profile"
										className="block px-4 py-2 rounded-lg text-sm text-black hover:bg-gray-200"
									>
										Profile
									</Link>
									<button
										className="w-full  px-4 py-2 rounded-lg text-sm text-black cursor-pointer hover:bg-gray-400 flex gap-1 items-center"
										onClick={handleSignOut}
									>
										<LogOut
											size={16}
											className="text-black"
										/>
										Logout
									</button>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>
			</header>

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
						label="PENDING PARTNER'S REVIEWS/KYC"
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

				<AdminStatusOverview
					approved={stats?.totalApprovedPartners || 0}
					pending={stats?.totalPendingPartners || 0}
					rejected={stats?.totalRejectedPartners || 0}
				/>
				<AdminEarning />

				<section className="bg-white rounded-2xl flex flex-wrap gap-2 px-2 py-3 overflow-hidden shadow-2xl">
					<TabButton
						icon={<RiGroupLine size={16} />}
						tag="Partner Reviews"
						active={activeTab === "Partner Reviews"}
						count={totalPendingPartnerReviews?.length ?? 0}
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
						count={pendingPricing?.length ?? 0}
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
							<PendingList
								list={totalPendingPartnerReviews ?? []}
								type={activeTab}
							/>
						)}
						{activeTab === "Video KYC" && (
							<PendingList
								list={pendingKyc ?? []}
								type={activeTab}
							/>
						)}
						{activeTab === "Pricing & Images" && (
							<PendingList
								list={pendingPricing ?? []}
								type={activeTab}
							/>
						)}
					</motion.div>
				</AnimatePresence>
			</main>
		</div>
	);
};

export default AdminDashboard;
