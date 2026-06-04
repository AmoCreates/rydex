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
			className={` ${active ? "bg-black text-white shadow-xl" : "bg-gray-50 text-gray-800 hover:bg-gray-200"} shadow-gray-400 cursor-pointer flex rounded-xl py-2 px-3 items-center gap-2 transition-all duration-300 outline-none`}
      onClick={onClick}
		>
			{icon} {tag}{" "}
			<div className={`rounded-full flex items-center justify-center text-xs font-semibold ${active ? "bg-white text-black" : "bg-black text-white"} h-5 w-5 rounded-full`}>{count}</div>
		</div>
	);
};

export default TabButton;
