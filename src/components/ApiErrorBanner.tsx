import { AlertTriangle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export default function ApiErrorBanner({
	message,
}: {
	message?: string | null;
}) {
	if (!message) return null;

	return (
		<AnimatePresence>
			<motion.div
      initial={{opacity: 0, y: -15}}
      animate={{opacity: 1, y: 0}}
			exit={{opacity: 0, y: -15}}
				className="rounded-2xl border border-red-200 bg-red-50 p-3 sm:p-4 text-red-700 shadow-sm"
			>
				<div className="flex items-start gap-3">
					<div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-red-100 text-red-600">
						<AlertTriangle className="h-4 w-4" />
					</div>
					<div className="flex-1">
						<p className="text-sm font-semibold text-red-800">
							Something went wrong
						</p>
						<p className="mt-0.5 text-sm text-red-700">{message.toLocaleLowerCase()}</p>
					</div>
				</div>
			</motion.div>
		</AnimatePresence>
	);
}
