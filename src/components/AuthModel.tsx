import { X } from "lucide-react";
import { motion } from "motion/react";
import React from "react";

type Props = {
	open: boolean;
	onClose: () => void;
};

const AuthModel = ({ open, onClose }: Props) => {
	if (!open) return null;
	return (
		<>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				onClick={onClose}
				className="fixed inset-0 z-90 bg-black/80 backdrop-blur-sm"
			>
				<motion.div
					initial={{ opacity: 0, scale: 0.95, y: 40 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					transition={{ duration: 0.35, ease: "easeOut" }}
					exit={{ scale: 0 }}
					className="fixed inset-0 z-100 flex items-center justify-center px-4"
				>
					<div className="relative w-full max-w-md rounded-3xl bg-white border border-black/10 shadow-[0_40px_100px_rgba(0, 0, 0, 0.35)] p-6 sm:p-8 text-black" onClick={(e) => e.stopPropagation()}>
					<X className="absolute right-4 top-4 text-gray-500 hover:text-black transition" onClick={onClose}/>
					</div>
				</motion.div>
			</motion.div>
		</>
	);
};

export default AuthModel;
