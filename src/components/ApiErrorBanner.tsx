"use client";

import { AlertTriangle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

export default function ApiErrorBanner({
	message,
	title,
	variant = "error",
	autoDismissMs,
}: {
	message?: string | null;
	title?: string;
	variant?: "error" | "notice";
	autoDismissMs?: number;
}) {
	const [isDismissed, setIsDismissed] = useState(false);

	useEffect(() => {
		if (!message || autoDismissMs === undefined) return;

		const timer = window.setTimeout(() => setIsDismissed(true), autoDismissMs);
		return () => window.clearTimeout(timer);
	}, [message, autoDismissMs]);

	const isNotice = variant === "notice";
	const isVisible = Boolean(message) && !isDismissed;

	return (
		<AnimatePresence>
			{message && isVisible && (
				<motion.div
					initial={{ opacity: 0, y: -15 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -15 }}
					role={isNotice ? "status" : "alert"}
					aria-live={isNotice ? "polite" : "assertive"}
					className={
						isNotice
							? "fixed left-1/2 top-4 z-100 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 rounded-2xl border border-amber-200 bg-white p-4 text-amber-950 shadow-xl sm:p-5"
							: "rounded-2xl border border-red-200 bg-red-50 p-3 text-red-700 shadow-sm sm:p-4"
					}
				>
					<div className="flex items-start gap-3">
						<div
							className={
								isNotice
									? "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700"
									: "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600"
							}
						>
							<AlertTriangle className="h-4 w-4" />
						</div>
						<div className="flex-1">
							<p
								className={
									isNotice
										? "text-sm font-semibold text-amber-950"
										: "text-sm font-semibold text-red-800"
								}
							>
								{title ?? "Something went wrong"}
							</p>
							<p
								className={
									isNotice
										? "mt-1 text-sm leading-relaxed text-amber-900"
										: "mt-0.5 text-sm text-red-700"
								}
							>
								{isNotice ? message : message.toLocaleLowerCase()}
							</p>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
