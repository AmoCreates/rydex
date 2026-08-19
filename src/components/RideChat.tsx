"use client";
import { RiSendPlaneFill, RiSparkling2Fill } from "@remixicon/react";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

type message = {
	bookingId: string;
	sender: "driver" | "customer";
	msg: string;
	createdAt: Date;
	tempId?: string;
};

type Props = {
	currentRole: string;
	bookingId: string;
	driverName: string;
	customerName: string;
	chat: message[] | [];
	chatSuggestions: string[] | [];
	suggestionLoading: boolean;
	suggestionErr: string;
	onSendMessage?: (message: string) => Promise<void> | void;
	onRefreshSuggestions?: () => Promise<void> | void;
};

const RideChat = ({
	currentRole,
	bookingId,
	driverName,
	customerName,
	chat,
	chatSuggestions,
	suggestionLoading,
	suggestionErr,
	onSendMessage,
	onRefreshSuggestions,
}: Props) => {
	const otherName = currentRole === "driver" ? customerName : driverName;
	const bottomRef = useRef<HTMLDivElement>(null);
	const [msg, setMsg] = useState("");
	const [loading, setLoading] = useState(false);

	const sendMsg = async () => {
		const trimmedMessage = msg.trim();
		if (trimmedMessage.length === 0 || loading) return;

		try {
			setLoading(true);
			if (onSendMessage) {
				await onSendMessage(trimmedMessage);
			}
			setMsg("");
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
				console.log(
					serverMessage ||
						axiosError?.response?.data ||
						axiosError?.message ||
						error,
				);
			} finally {
			setLoading(false);
		}
	};

	const formatTime = (nonFormatedDate: Date | string) => {
		const date = new Date(nonFormatedDate);
		return date.toLocaleDateString([], {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
		requestAnimationFrame(() => {
			bottomRef.current?.scrollIntoView({ behavior, block: "end" });
		});
	};

	// 1. Scroll whenever chat messages update
	useEffect(() => {
		if (chat.length > 0) {
			scrollToBottom("smooth");
		}
	}, [chat]);

	// 2. Scroll immediately when RideChat mounts (e.g. when chatOpen becomes true)
	useEffect(() => {
		// Instant scroll on mount so the user doesn't see a delayed auto-scroll animation from top to bottom
		scrollToBottom("auto");
	}, []);

	// In RideChat.tsx - add chatOpen to props if needed, or simply handle layout changes:
	useEffect(() => {
		const timer = setTimeout(() => {
			bottomRef.current?.scrollIntoView({ behavior: "smooth" });
		}, 300); // Wait for open animation (~320ms) to complete

		return () => clearTimeout(timer);
	}, []);

	return (
		<div className="flex flex-col h-full min-h-0 bg-white rounded-2xl overflow-hidden border border-zinc-100">
			<div className="shrink-0 flex items-center gap-3 px-4 py-3 bg-white border-b border-zinc-100">
				<div className="relative shrink-0">
					<div className="w-9 h-9 rounded-full bg-zinc-950 flex items-center justify-center text-white text-xs font-bold">
						{otherName?.charAt(0).toUpperCase()}
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
				{/* 3. Empty dummy div anchoring the bottom */}
				<div ref={bottomRef} />
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

						{suggestionErr && chatSuggestions.length == 0 && (
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
											className={`py-1 px-2.5 bg-zinc-100 rounded-xl cursor-pointer hover:bg-violet-50 hover:text-violet-600 text-xs text-zinc-800 active:scale-97 transition-all`}
										>
											{msg}
										</div>
									);
								})}
							</div>
						)}

						<div className="flex flex-1 rounded-full p-1.5 gap-2 bg-zinc-100 items-center ">
							<button
								id="gts"
								className="bg-white h-7 w-7 rounded-full flex justify-center items-center cursor-pointer"
								type="button"
								onClick={onRefreshSuggestions}
							>
								<RiSparkling2Fill
									size={15}
									className="text-violet-500"
								/>
							</button>

							<input
								className="flex-1 outline-none text-zinc-600 text-sm py-1.5 min-w-0"
								type="text"
								value={msg}
								onChange={(e) => setMsg(e.target.value)}
								placeholder="Send a message..."
								onKeyDown={(e) =>
									e.key === "Enter" && sendMsg()
								}
							/>

							<button
								className={` h-7 w-7 rounded-full flex justify-center items-center active:scale-97 transition-all ${msg.trim().length === 0 || loading ? "bg-zinc-700 pointer-events-none" : "bg-zinc-950 cursor-pointer"}`}
								disabled={msg.trim().length === 0 || loading}
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
