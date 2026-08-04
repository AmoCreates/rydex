"use client";
import { Clock4, IndianRupee, MessageCircle, Phone, User2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import RideChat from "./RideChat";
import { useSelector } from "react-redux";
import { RootState } from "@/Toolkit/store";

const PanleContent = ({
	isActive,
	displayDistance,
	displayTime,
	cfg,
	status,
	booking,
	paymentStatus,
}: any) => {
	const canChat = status === "awaiting pickup";
	const [chatOpen, setChatOpen] = useState(false);
	const { userData } = useSelector((state: RootState) => state.user);
	console.log(booking);

	const [currRole, setCurrRole] = useState("");
	useEffect(() => {
		(() => {
			if (userData) {
				const role =
					userData?.role === "partner" ? "driver" : "customer";
				setCurrRole(role);
			}
		})();
	}, [userData, userData?._id, userData?.role, currRole]);

	return (
		<div className="flex flex-col pt-5 pb-4 gap-3">
			{isActive && (
				<div className="mx-5 lg:mx-6 grid grid-cols-2 gap-2">
					<div className="bg-ainc-50 border border-zinc-100 rounded-2xl p-4 flex items-center gap-3">
						<div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
							<Clock4 size={16} className="text-zinc-600" />
						</div>
						<div>
							<p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
								ETA
							</p>
							<p className="text-lg font-black text-zinc-900 leading-none mt-0.5">
								{Math.round(displayTime)}
								<span className="text-xs font-normal text-zinc-400 ml-0.5">
									min
								</span>
							</p>
						</div>
					</div>
					<div className="bg-zinc-950 rounded-2xl p-4 flex items-center gap-3">
						<div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
							<IndianRupee size={16} className="text-white" />
						</div>
						<div>
							<p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
								Fare
							</p>
							<p className="text-lg font-black text-white leading-none mt-0.5">
								{booking?.fare}
							</p>
						</div>
					</div>
				</div>
			)}

			{booking?.customer && (
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="mx-5 lg:mx-6"
				>
					<div className="bg-zinc-950 rounded-2xl p-4 flex items-center gap-4">
						<div className="relative shrink-0">
							<div className="w-14 h-14 bg-zinc-800 flex items-center justify-center rounded-xl">
								<User2 size={26} className="text-zinc-300" />
							</div>
							<div className="absolute -bottom-1 -right-1 bg-emerald-400 w-4 h-4 rounded-full border-2 border-zinc-950" />
						</div>
						<div className="flex-1 min-w-0">
							<div className="flex items-center justify-between gap-2">
								<p className="text-white font-bold text-base truncate">
									{booking.customerName || "customer"}
								</p>
								<div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full shrink-0">
									<IndianRupee
										size={10}
										className="text-amber-400"
									/>
									<span className="text-white text-xs font-semibold">
										{booking.fare}
									</span>
								</div>
							</div>

							{booking.paymentMode && (
								<div className="flex items-center gap-2 mt-1.5">
									<span
										className={`${paymentStatus.cls ?? "bg-zinc-700 text-zinc-300"} rounded-full text-[10px] px-2 py-0.5 font-semibold`}
									>
										{paymentStatus.label}
									</span>
								</div>
							)}
						</div>
					</div>
					{isActive && (
						<div className="flex gap-2 mt-2">
							{booking?.customerMobile && (
								<a
									href={`tel:${booking?.customerMobile}`}
									className={`flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 active:scale-[0.97] transition-all text-zinc-900 py-3 rounded-xl text-sm font-semibold ${canChat ? "flex-1" : "w-full"}`}
								>
									<Phone size={15} /> Call
								</a>
							)}

							{canChat && (
								<button
									className={`flex-1 flex items-center justify-center gap-2 active:scale-[0.97] transition-all py-3 rounded-xl cursor-pointer text-sm font-semibold ${chatOpen ? "bg-zinc-200 text-zinc-900" : "bg-zinc-900 hover:bg-zinc-800 text-white"}`}
									onClick={() => setChatOpen(!chatOpen)}
								>
									<MessageCircle size={15} />
									{chatOpen ? "Close chat" : "Message"}
								</button>
							)}
						</div>
					)}
				</motion.div>
			)}

			<AnimatePresence>
				{chatOpen && canChat && (
					<motion.div
						key="chat"
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={{
							duration: 0.32,
							ease: [0.22, 1, 0.36, 1],
						}}
						className="mx-5 lg:mx-6 overflow-hidden"
					>
						<div className="rounded-2xl overflow-hidden border border-zinc-100 h-[460px]">
							<RideChat
								currentRole={currRole}
								bookingId={booking?._id}
								driverName={booking?.driver.name}
								customerName={booking?.customerName}
							/>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default PanleContent;
