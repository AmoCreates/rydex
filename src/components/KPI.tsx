import { Clock4, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

const KPI = ({ label, value, icon, desc, color, hover }: any) => {
	return (
		<div
			className={`bg-white rounded-xl text-gray-400 p-5 flex flex-col gap-4 ${hover} shadow-2xl hover:-translate-y-3 hover:scale-102 transition-all duration-300 cursor-pointer`}
		>
			<div className="flex justify-between items-start">
				<motion.div
				whileHover={{rotate: -6, scale: 1.1}}
				transition={{type: "spring", stiffness: 400}}
					className={`flex items-center justify-center h-10 w-10 ${color} rounded-xl `}
				>
					{icon}
				</motion.div>
				<div className="flex items-center gap-1 bg-green-50 text-green-900 font-semibold text-xs rounded-full py-1 px-2">
					<TrendingUp size={12} />
					+12%
				</div>
			</div>

			<div className="space-y-1">
				<p className="text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase">
					{label}
				</p>
				<motion.div
				initial={{opacity: 0, y: 8}}
				animate={{opacity: 1, y: 0}}
				transition={{duration: 0.4, delay: 0.2}}
				className="text-black font-black text-4xl tracking-tight">
					{value?.toLocaleString() || "0"}
				</motion.div>
			</div>

			<div className="flex justify-between items-center border-gray-100 border-t pt-4 mt-2">
				<p className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
					<span className="h-1.5 w-1.5 rounded-full bg-current opacity-50 mt-1" />
					{desc}
				</p>
				<div className="text-gray-300">
					<Clock4 size={14} strokeWidth={2.5} />
				</div>
			</div>
		</div>
	);
};

export default KPI;
