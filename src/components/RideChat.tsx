"use client";
import { RiSendPlaneFill, RiSparkling2Fill } from "@remixicon/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bike, UserRound } from "lucide-react";

type Props = {
	currentRole: string;
	bookingId: string;
	driverName: string;
	customerName: string;
};

type message = {
	bookingId: string;
	sender: "driver" | "customer";
	msg: string;
	createdAt: Date;
};

const RideChat = ({
	currentRole,
	bookingId,
	driverName,
	customerName,
}: Props) => {
	const otherName = currentRole === "driver" ? customerName : driverName;
	const myName = currentRole === "driver" ? driverName : customerName;
	const icon =
		currentRole === "driver" ? <Bike size={15} /> : <UserRound size={15} />;
	const [chat, setChat] = useState<message[]>([]);
	const [chatSuggestions, setChatSuggestions] = useState<string[]>([]);
	const [suggestionLoading, setSuggestionLoading] = useState(true);
	const [msg, setMsg] = useState("");
	const [loading, setLoading] = useState(false);
	const [suggestionErr, setSuggestionErr] = useState("")

	useEffect(() => {
		const getSuggestions = async () => {
			try {
				setSuggestionErr("")
				setSuggestionLoading(true);
				const res = await axios.post("/api/chat/ai-suggestions", {
					bookingId,
				});
				console.log(res);
				if (res.status === 200) {
					console.log(res.data.suggestions);
					setChatSuggestions(res.data.suggestions);
				}
			} catch (error: any) {
				console.log(error.response.data.message);
				setSuggestionErr("Sorry!, unable to generate suggestions right now.")
			} finally {
				setSuggestionLoading(false);
			}
		};

		getSuggestions();
	}, [bookingId]);

	const sendMsg = async () => {
		if (msg.length === 0) return;
		try {
			setLoading(true);
			const { data } = await axios.post("/api/chat/send", {
				bookingId,
				sender: currentRole,
				msg,
			});

			console.log(data);
		} catch (error: any) {
			console.log(error.response.data.message);
		} finally {
			setLoading(false);
			setMsg("");
		}
	};

	const formatTime = (nonFormatedDate: Date | string) => {
		const date = new Date(nonFormatedDate);
		return date.toLocaleDateString([], {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	useEffect(() => {
		const getChat = async () => {
			console.log(bookingId);
			if (!bookingId) return;

			try {
				const { data } = await axios.post("/api/chat/get-chat", {
					bookingId,
				});
				console.log("Chat data:", data);
				setChat(data || []);
			} catch (error: any) {
				console.error(
					"Error fetching chat:",
					error?.response?.data || error.message || error,
				);
			}
		};

		getChat();
	}, [bookingId]);

	return (
		<div className="flex flex-col h-full min-h-0 bg-white rounded-2xl overflow-hidden border border-zinc-100">
			<div className="shrink-0 flex items-center gap-3 px-4 py-3 bg-white border-b border-zinc-100">
				<div className="relative shrink-0">
					<div className="w-9 h-9 rounded-full bg-zinc-950 flex items-center justify-center text-white text-xs font-bold">
						{otherName.charAt(0).toUpperCase()}
					</div>
					<span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white bg-emerald-400" />
				</div>

				<div className="flex-1 min-w-0">
					<p className="text-sm font-bold text-zinc-900 leading-none">
						{otherName}
					</p>
					<p className="text-[11px] text-emerald-500 font-semibold mt-0.5">
						Active Now
					</p>
				</div>
			</div>

			<div
				className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-zinc-50"
				style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
			>
				<style>{`div::-webkit-scrollbar {display: none;}`}</style>

				{chat.length === 0 && (
					<div className="flex flex-col items-center justify-center h-full gap-3 py-16">
						<div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center">
							<RiSendPlaneFill
								size={18}
								className="text-zinc-400"
							/>
						</div>
						<p className="text-sm text-zinc-400 font-medium">
							No messages yet
						</p>
						<p className="text-xs text-zinc-300">
							Start the conversation below
						</p>
					</div>
				)}

				{chat.length > 0 &&
					chat.map((c, i) => {
						const isMine = c.sender === currentRole;
						return (
							<motion.div
								key={i}
								initial={{ opacity: 0, y: 8, scale: 0.97 }}
								animate={{ opacity: 1, y: 0, scale: 1 }}
								transition={{
									duration: 0.18,
									ease: [0.22, 1, 0.36, 1],
								}}
								className={`flex items-center gap-2 ${isMine ? "justify-end" : "justify-start"}`}
							>
								<div
									className={`max-w-[72%] px-3.5 py-2.5 text-sm leading-relaxed rounded-2xl shadow-sm ${isMine ? "bg-zinc-950 text-white rounded-br-sm" : "bg-white border-zinc-200 text-zinc-900 rounded-bl-sm"}`}
								>
									<p className="wrap-break-word">{c.msg}</p>
									<span className="text-[10px]">
										{formatTime(c.createdAt)}
									</span>
								</div>
							</motion.div>
						);
					})}
			</div>

			<AnimatePresence>
				<motion.div
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: "auto" }}
					exit={{ opacity: 0, height: 0 }}
					className="shrink-0 overflow-hidden border-t border-zinc-100 bg-white"
				>
					<div className="px-4 pt-3 pb-2">
						<div className="flex items-center justify-between mb-2">
							<div className="flex items-center gap-1.5">
								<RiSparkling2Fill
									size={12}
									className="text-violet-500"
								/>
								<span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
									AI Suggestions
								</span>
							</div>
						</div>

						{suggestionErr && (
							<p className="text-[11px] text-red-500 mb-2">
								{suggestionErr}
							</p>
						)}

						{suggestionLoading ? (
							<div className="flex flex-wrap gap-2 mb-3">
								{[24, 10, 16, 24, 20, 24, 16, 10].map(
									(c, i) => {
										return (
											<div
												key={i}
												className={`h-6 w-${c} bg-zinc-100 rounded-xl animate-pulse`}
											/>
										);
									},
								)}
							</div>
						) : (
							<div className="flex flex-wrap gap-2 mb-3">
								{chatSuggestions.map((msg, i) => {
									return (
										<div
											onClick={() => setMsg(msg)}
											key={i}
											className={`py-1 px-2.5 bg-zinc-100 rounded-xl cursor-pointer hover:bg-zinc-300 text-xs text-zinc-800 active:scale-97 transition-all`}
										>
											{msg}
										</div>
									);
								})}
							</div>
						)}

						<div className="flex rounded-xl p-1.5 gap-2 bg-zinc-100">
							<div className="bg-white h-7 w-7 rounded-lg flex justify-center items-center">
								{icon}
							</div>

							<input
								className="flex-1 outline-none text-zinc-600"
								type="text"
								value={msg}
								onChange={(e) => setMsg(e.target.value)}
								placeholder={`${currentRole === "driver" ? "main paunch gaya, aap kha ho ?" : "Kab tak aaoge ?"}`}
								onKeyDown={(e) => e.key === 'Enter' && sendMsg()}
							/>

							<button
								className={` h-7 w-7 rounded-lg flex justify-center items-center active:scale-97 transition-all ${msg.length === 0 ? "bg-zinc-700 pointer-events-none" : "bg-zinc-950 cursor-pointer"}`}
								disabled={msg.length === 0}
								onClick={sendMsg}
							>
								{
									<RiSendPlaneFill
										size={15}
										className="text-white"
									/>
								}
							</button>
						</div>
					</div>
				</motion.div>
			</AnimatePresence>
		</div>
	);
};

export default RideChat;
