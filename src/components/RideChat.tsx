import React from "react";

type Props = {
	currentRole: string;
	bookingId: string;
	driverName: string;
	customerName: string;
};

const RideChat = ({
	currentRole,
	bookingId,
	driverName,
	customerName,
}: Props) => {
	const otherName = currentRole === "driver" ? customerName : driverName;
	const myName = currentRole === "driver" ? driverName : customerName;
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
          <p className="text-sm font-bold text-zinc-900 leading-none">{otherName}</p>
          <p className="text-[11px] text-emerald-500 font-semibold mt-0.5">Active Now</p>
        </div>
			</div>
		</div>
	);
};

export default RideChat;
