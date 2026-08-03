import { Clock4, IndianRupee } from "lucide-react";
import React from "react";

const PanleContent = ({
	isActive,
	displayDistance,
	displayTime,
	cfg,
	status,
	booking
}: any) => {
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
								{Math.round(displayTime)}<span className="text-xs font-normal text-zinc-400 ml-0.5">min</span>
							</p>
						</div>
					</div>
          <div className="bg-zinc-950 rounded-2xl p-4 flex items-center gap-3">
						<div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
						<IndianRupee size={16} className="text-white"/>
						</div>
						<div>
							<p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Fare</p>
							<p className="text-lg font-black text-white leading-none mt-0.5">{booking.fare}</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default PanleContent;
