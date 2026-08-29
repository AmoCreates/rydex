"use client";

import { ExternalLink, Play, Sparkles, Video, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

export default function VideoGuidePopup() {
	const [isOpen, setIsOpen] = useState(false);
	const [minimized, setMinimized] = useState(false);

	useEffect(() => {
		// Automatically open popup after 1 second for smooth user onboarding
		const timer = setTimeout(() => {
			setIsOpen(true);
		}, 1000);

		return () => clearTimeout(timer);
	}, []);

	const guides = [
		{
			id: "book-ride",
			title: "Book Your First Ride",
			desc: "Learn how to easily search & book any vehicle on Rydex",
			link: "https://lnkd.in/p/dFW4pVes",
			badge: "Rider Guide",
			color: "from-blue-600 to-indigo-600",
			iconBg: "bg-blue-500/20 text-blue-400 border-blue-500/30",
		},
		{
			id: "become-partner",
			title: "How to Become a Partner",
			desc: "Step-by-step video guide to list your vehicle & start earning",
			link: "https://lnkd.in/p/dddUSgHQ",
			badge: "Partner Guide",
			color: "from-emerald-600 to-teal-600",
			iconBg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
		},
	];

	return (
		<div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
			<AnimatePresence>
				{isOpen && !minimized && (
					<motion.div
						initial={{ opacity: 0, y: 40, scale: 0.9 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 30, scale: 0.9 }}
						transition={{ type: "spring", stiffness: 300, damping: 25 }}
						className="pointer-events-auto w-full max-w-sm rounded-3xl bg-zinc-950/90 text-white p-5 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl"
					>
						{/* Header */}
						<div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
							<div className="flex items-center gap-2">
								<div className="p-1.5 rounded-lg bg-white/10 text-yellow-400">
									<Sparkles size={18} />
								</div>
								<div>
									<h3 className="font-bold text-sm text-white leading-tight">
										Need Help Getting Started?
									</h3>
									<p className="text-[11px] text-zinc-400">
										Watch quick video walkthroughs
									</p>
								</div>
							</div>
							<button
								onClick={() => setMinimized(true)}
								className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
								title="Minimize"
							>
								<X size={18} />
							</button>
						</div>

						{/* Video Guide Cards */}
						<div className="space-y-3">
							{guides.map((guide) => (
								<motion.a
									key={guide.id}
									href={guide.link}
									target="_blank"
									rel="noopener noreferrer"
									whileHover={{ scale: 1.02, x: 2 }}
									whileTap={{ scale: 0.98 }}
									className="group flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
								>
									<div className="flex items-center gap-3">
										<div
											className={`relative flex items-center justify-center w-10 h-10 rounded-xl border ${guide.iconBg} shadow-inner shrink-0`}
										>
											<Play size={18} className="ml-0.5 fill-current" />
											<span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
												<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
												<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
											</span>
										</div>
										<div>
											<div className="flex items-center gap-2">
												<h4 className="font-semibold text-sm text-white group-hover:text-sky-300 transition">
													{guide.title}
												</h4>
											</div>
											<p className="text-[11px] text-zinc-400 line-clamp-1">
												{guide.desc}
											</p>
										</div>
									</div>
									<div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-white/20 text-zinc-400 group-hover:text-white transition shrink-0">
										<ExternalLink size={15} />
									</div>
								</motion.a>
							))}
						</div>

						{/* Footer note */}
						<div className="mt-4 pt-2 text-center text-[10px] text-zinc-500 border-t border-white/5">
							LinkedIn Video Guides • Opens in new tab
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Persistent Floating Pill Button (Always visible on page) */}
			<motion.button
				onClick={() => {
					setIsOpen(true);
					setMinimized((prev) => !prev);
				}}
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
				className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-zinc-900 text-white border border-white/20 shadow-xl hover:bg-black transition cursor-pointer group"
			>
				<span className="relative flex h-3 w-3">
					<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
					<span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
				</span>
				<Video size={16} className="text-sky-400 group-hover:rotate-12 transition-transform" />
				<span className="text-xs font-semibold">Video Guides</span>
			</motion.button>
		</div>
	);
}
