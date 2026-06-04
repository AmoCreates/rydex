import { Clock4, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

const KPI = ({ label, value, icon, desc, color, hover }: any) => {
	return (
		<div className={`bg-white rounded-xl text-gray-400 p-5 flex flex-col gap-4 ${hover} shadow-2xl transition-shadow`}>
			<div className="flex justify-between items-start">
				<div
					className={`flex items-center justify-center h-10 w-10 ${color} rounded-xl `}
				>
					{icon}
				</div>
				<div className="flex items-center gap-1 bg-green-50 text-green-900 font-semibold text-xs rounded-full py-1 px-2">
					<TrendingUp size={12} />
					+12%
				</div>
			</div>

			<p className=" text-sm font-semibold">{label}</p>
			<h1 className="text-black font-bold text-3xl -mt-2">{value}</h1>

			<div className="flex justify-between items-center border-gray-200 border-t pt-3">
				<p className="text-sm">{desc}</p>
				<Clock4 size={14} />
			</div>
		</div>
	);
};

export default KPI;
