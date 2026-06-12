import React from "react";
import { motion } from "motion/react";
import { Video } from "lucide-react";
import { useRouter } from "next/navigation";

const ActionCard = ({ videoKycStatus, roomId }: any) => {
	const router = useRouter();
	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className="bg-white border border-gray-400 rounded-2xl md:rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.15)] p-5 sm:p-8 overflow-x-auto flex flex-wrap items-center justify-between gap-4"
		>
			<div className="flex flex-wrap items-center gap-4">
				<div className="flex justify-center items-center bg-black text-white rounded-xl h-12 w-12 shrink-0">
					<Video size={18} />
				</div>

				<div>
					<p className="font-semibold sm:text-lg md:text-xl text-base ">
						{videoKycStatus === "pending"
							? "Waiting for Admin"
							: "Admin Started Video KYC"}
					</p>
					<p className="text-gray-500 text-[13px] sm:text-[15px] ">
						{videoKycStatus === "pending"
							? "Admin will start Video KYC shortly."
							: "Please join call now."}
					</p>
				</div>
			</div>

			{
        videoKycStatus === "in progress" &&
        <button className="bg-blue-500 text-white px-4 py-2 rounded-xl active:scale-96 cursor-pointer animate-pulse font-semibold hover:animate-none w-full sm:w-auto transition-all"
				onClick={() => router.push(`/video-kyc/${roomId}`)}
				>
				Join Call
			</button>
      }
		</motion.div>
	);
};

export default ActionCard;
