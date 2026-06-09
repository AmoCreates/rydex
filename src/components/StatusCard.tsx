import { Clock4 } from "lucide-react";
import { motion } from "motion/react";

const StatusCard = () => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className="bg-white border border-gray-400 rounded-2xl md:rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.15)] p-5 sm:p-8 overflow-x-auto flex flex-wrap items-start gap-4"
		>
			<div className="flex  justify-center items-center bg-black text-white rounded-xl h-12 w-12 shrink-0">
				<Clock4 size={18} />
			</div>

			<div>
				<p className="font-semibold sm:text-lg md:text-xl text-base ">Documents Under Review</p>
				<p className="text-gray-500 text-[13px] sm:text-[15px] ">
					Rydex team will verify your documents.
				</p>
			</div>
		</motion.div>
	);
};

export default StatusCard;
