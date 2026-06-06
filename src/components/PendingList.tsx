"use client";
import React from "react";
import { motion } from "motion/react";
import { ArrowRight, CheckCircle2, User } from "lucide-react";
import { useRouter } from "next/navigation";

const PendingList = ({ list, type }: any) => {
	const router = useRouter();
	if (list?.length === 0) {
		return (
			<motion.div
				animate={{ opacity: 1 }}
				className="bg-white rounded-2x py-16 text-center rounded-2xl border-gray-200 shadow-xl"
			>
				<div className="flex flex-col items-center">
					<div className="bg-green-50 text-green-600 h-12 w-12 rounded-xl flex items-center justify-center mb-4">
						<CheckCircle2 size={22} />
					</div>
					<p className="font-bold text-base text-gray-800">All caught up!</p>
					<p className="text-gray-400 mt-1 text-sm">
						No pending {type}s right now.
					</p>
				</div>
			</motion.div>
		);
	}
	return (
		<div className="space-y-3 bg-white pt-4 px-4 py-10 rounded-2xl shadow-2xl overflow-hidden">
			<div className="flex items-center justify-between px-1 mb-1">
				<p className="uppercase text-gray-400 text-xs font-semibold tracking-widest">
					{type === "Partner Reviews"
						? "Partner Reviews Queue"
						: type === "Video KYC"
							? "Video KYC Queue"
							: "Pricing & Vehicle Reviews Queue"}
				</p>
				<p className="text-xs text-gray-400">{list.length} Items</p>
			</div>

			{list.map((item: any, idx: number) => {
				const name = item.name;
				const email = item.email;
				const initial = name.charAt(0).toUpperCase();
				const colorPallate =
					initial === "A"
						? "bg-green-100 text-green-800"
						: initial === "B"
							? "bg-blue-100 text-blue-800"
							: initial === "C"
								? "bg-yellow-100 text-yellow-800"
								: initial === "D"
									? "bg-purple-100 text-purple-800"
									: initial === "E"
										? "bg-pink-100 text-pink-800"
										: initial === "F"
											? "bg-orange-100 text-orange-800"
											: "bg-red-100 text-red-800";
				return (
					<motion.div
						key={idx}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: idx * 0.5 }}
						whileHover={{ y: -3 }}
						className="mt-4 bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 hover:shadow-xl shadow-sm hover:shadow-gray-400 transition-shadow"
					>
						<div className="flex items-center gap-3 min-w-0">
							<div
								className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${colorPallate}`}
							>
								{initial ?? <User size={20} />}
							</div>

							<div className="min-w-0 flex flex-col -space-y-0.5">
								<p className="font-bold text-sm text-gray-900 truncate">
									{name}
								</p>
								<p className="text-gray-400 text-sm truncate">{email}</p>
							</div>
						</div>

						<div className="shrink-0">
							<button
								className="active:scale-96 cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-sm font-semibold transition-all"
								onClick={() =>
									type == "Partner Reviews" && router.push(`/admin/reviews/partner/${item._id}`)
								}
							>
								Review <ArrowRight size={16} />{" "}
							</button>
						</div>
					</motion.div>
				);
			})}
		</div>
	);
};

export default PendingList;
