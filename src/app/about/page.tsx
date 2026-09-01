"use client";
import React, { useState } from "react";
import { motion } from "motion/react";
import {
	Bike,
	Car,
	Truck,
	Bus,
	ShieldCheck,
	Clock,
	MapPin,
	Sparkles,
	Users,
	Award,
	CheckCircle2,
	Zap,
	ChevronRight,
} from "lucide-react";
import Link from "next/link";
import Nav from "@/components/Nav";
import AuthModel from "@/components/AuthModel";
import Footer from "@/components/Footer";
import { useSelector } from "react-redux";
import { RootState } from "@/Toolkit/store";
import { useRouter } from "next/navigation";

const stats = [
	{ label: "Successful Rides", value: "10k+", icon: CheckCircle2 },
	{ label: "Verified Partners", value: "500+", icon: Users },
	{ label: "On-Time Rate", value: "99.8%", icon: Clock },
	{ label: "Cities Covered", value: "25+", icon: MapPin },
];

const features = [
	{
		title: "Multi-Vehicle Fleet",
		desc: "From agile 2-wheelers and comfortable sedans to heavy-duty trucks and buses, book any ride according to your exact capacity needs.",
		icon: Car,
		gradient: "from-amber-500/20 to-orange-500/5",
	},
	{
		title: "Verified Vehicle Owners",
		desc: "Every owner undergoes strict document validation and Video KYC verification, ensuring maximum security and peace of mind.",
		icon: ShieldCheck,
		gradient: "from-emerald-500/20 to-teal-500/5",
	},
	{
		title: "Real-Time Tracking & Live Map",
		desc: "Track your active rides with precision live GPS navigation, instant ETA estimates, and direct owner communication.",
		icon: Zap,
		gradient: "from-sky-500/20 to-blue-500/5",
	},
	{
		title: "Transparent & Fair Pricing",
		desc: "No surprise surge fees or hidden charges. Direct vendor-to-customer pricing model ensures affordable rates for every journey.",
		icon: Award,
		gradient: "from-purple-500/20 to-pink-500/5",
	},
];

const AboutPage = () => {
	const [authOpen, setAuthOpen] = useState(false);
	const { userData } = useSelector((state: RootState) => state.user);
	const router = useRouter();

	const handleBookClick = () => {
		if (!userData) {
			if (typeof window !== "undefined") {
				window.localStorage.setItem("redirectAfterLogin", "/customer/book");
			}
			setAuthOpen(true);
		} else {
			router.push("/customer/book");
		}
	};

	return (
		<div className="w-full min-h-screen bg-black text-white flex flex-col selection:bg-white selection:text-black">
			{/* Navbar */}
			<Nav onOpen={() => setAuthOpen(true)} />

			{/* Main Content */}
			<main className="flex-1 pt-28 pb-20">
				{/* Hero Section */}
				<section className="relative px-6 md:px-12 max-w-7xl mx-auto text-center pt-10 pb-16">
					<div className="absolute inset-0 -z-10 flex items-center justify-center">
						<div className="w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
					</div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs font-semibold uppercase tracking-widest text-gray-300 mb-6"
					>
						<Sparkles size={14} className="text-yellow-400" />
						About RYDEX Platform
					</motion.div>

					<motion.h1
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.1 }}
						className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight"
					>
						Redefining Smart <br className="hidden sm:block" />
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-500">
							Vehicle Logistics & Mobility
						</span>
					</motion.h1>

					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="mt-6 text-gray-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
					>
						RYDEX is a multi-vendor vehicle booking ecosystem connecting passengers and businesses with trusted vehicle partners across bikes, cars, loading vehicles, and heavy transport.
					</motion.p>

					{/* Vehicle Icons */}
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.6, delay: 0.3 }}
						className="mt-10 flex items-center justify-center gap-6 sm:gap-10 text-gray-400"
					>
						{[
							{ icon: Bike, label: "Bike" },
							{ icon: Car, label: "Car" },
							{ icon: Truck, label: "Truck" },
							{ icon: Bus, label: "Bus" },
						].map((item, idx) => (
							<div key={idx} className="flex flex-col items-center gap-2 group">
								<div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all duration-300 group-hover:scale-110 shadow-lg">
									<item.icon size={26} />
								</div>
								<span className="text-xs text-gray-500 font-medium group-hover:text-gray-300 transition-colors">
									{item.label}
								</span>
							</div>
						))}
					</motion.div>
				</section>

				{/* Stats Grid */}
				<section className="px-6 md:px-12 max-w-7xl mx-auto my-12">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
						{stats.map((stat, idx) => {
							const Icon = stat.icon;
							return (
								<motion.div
									key={idx}
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ duration: 0.4, delay: idx * 0.1 }}
									className="p-6 rounded-3xl bg-zinc-900/80 border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all duration-300"
								>
									<div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white mb-4">
										<Icon size={20} />
									</div>
									<div>
										<h3 className="text-3xl sm:text-4xl font-extrabold text-white">
											{stat.value}
										</h3>
										<p className="text-xs sm:text-sm text-gray-400 mt-1 font-medium">
											{stat.label}
										</p>
									</div>
								</motion.div>
							);
						})}
					</div>
				</section>

				{/* Mission & Vision Section */}
				<section className="px-6 md:px-12 max-w-7xl mx-auto my-20">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						<motion.div
							initial={{ opacity: 0, x: -30 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6 }}
							className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-white/10 relative overflow-hidden"
						>
							<div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
								<Sparkles size={24} />
							</div>
							<h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
								Our Mission
							</h2>
							<p className="text-gray-400 text-sm sm:text-base leading-relaxed">
								To empower vehicle owners with sustainable earning opportunities while offering customers a frictionless, verified, and reliable booking experience for any journey or haul.
							</p>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, x: 30 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6 }}
							className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-white/10 relative overflow-hidden"
						>
							<div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-6">
								<Award size={24} />
							</div>
							<h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
								Our Vision
							</h2>
							<p className="text-gray-400 text-sm sm:text-base leading-relaxed">
								Building India&#39;s premier multi-modal vehicle platform where booking a bike, car, or heavy goods truck is as effortless as a single tap, backed by complete transparency.
							</p>
						</motion.div>
					</div>
				</section>

				{/* Key Features Grid */}
				<section className="px-6 md:px-12 max-w-7xl mx-auto my-20">
					<div className="text-center max-w-2xl mx-auto mb-14">
						<h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
							Why Choose RYDEX?
						</h2>
						<p className="text-gray-400 text-sm sm:text-base mt-4">
							Built with cutting-edge technology to ensure safe, swift, and transparent transport solutions.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{features.map((feature, idx) => {
							const Icon = feature.icon;
							return (
								<motion.div
									key={idx}
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ duration: 0.5, delay: idx * 0.1 }}
									className={`p-8 rounded-3xl bg-zinc-900/60 border border-white/10 hover:border-white/25 transition-all duration-300 bg-gradient-to-br ${feature.gradient}`}
								>
									<div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white mb-6">
										<Icon size={24} />
									</div>
									<h3 className="text-xl font-bold text-white mb-2">
										{feature.title}
									</h3>
									<p className="text-gray-400 text-sm leading-relaxed">
										{feature.desc}
									</p>
								</motion.div>
							);
						})}
					</div>
				</section>

				{/* Call to Action */}
				<section className="px-6 md:px-12 max-w-7xl mx-auto mt-24">
					<div className="p-8 sm:p-14 rounded-3xl bg-white text-black text-center relative overflow-hidden shadow-2xl">
						<h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
							Ready to Ride or Partner With Us?
						</h2>
						<p className="mt-4 max-w-xl mx-auto text-gray-700 text-sm sm:text-base font-medium">
							Join thousands of satisfied riders and verified vehicle partners on RYDEX today.
						</p>
						<div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
							<button
								onClick={handleBookClick}
								className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-black text-white font-semibold text-base hover:bg-gray-900 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
							>
								Book a Ride <ChevronRight size={18} />
							</button>
							<Link
								href="/partner/onboarding/vehicle"
								className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gray-200 text-black font-semibold text-base hover:bg-gray-300 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
							>
								Become a Partner
							</Link>
						</div>
					</div>
				</section>
			</main>

			{/* Auth Modal */}
			<AuthModel open={authOpen} onClose={() => setAuthOpen(false)} />

			{/* Footer */}
			<Footer />
		</div>
	);
};

export default AboutPage;
