import React, { ReactNode } from "react";

type Props = {
	icon: ReactNode;
	tag: string;
	active: boolean;
  count: number;
	onClick: () => void;
};

const TabButton = ({ icon, tag, active, count, onClick }: Props) => {
	return (
		<div
			className={` ${active ? "bg-black text-white" : "bg-gray-50 text-gray-800 hover:bg-gray-200 shadow-xl"} shadow-gray-400 cursor-pointer flex rounded-xl py-2 px-3 items-center gap-2 transition-all duration-300 outline-none text-sm `}
      onClick={onClick}
		>
			{icon} Pending {tag}{" "}
			<div className={`rounded-full flex items-center justify-center text-[11px] font-semibold ${active ? "bg-white text-black" : count > 0 ? "bg-red-500 text-white" : "bg-gray-200 text-gray-400"} h-5 w-5 rounded-full`}>{count}</div>
		</div>
	);
};

export default TabButton;
