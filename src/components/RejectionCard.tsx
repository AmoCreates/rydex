import { TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import {motion} from 'motion/react'

const RejectionCard = ({rejectionMsg}: any) => {
  const router = useRouter();
	return (
		<motion.div
		initial={{opacity: 0, y: 10}}
		animate={{opacity: 1, y: 0}}
		className="bg-red-50 border border-red-200 rounded-2xl md:rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.15)] p-5 sm:p-6 md:p-8 space-y-4 flex-col items-start gap-4">
			<p className="flex gap-2 text-red-800 font-semibold">
				<TriangleAlert size={18}/> Details/documents rejected by Rydex team
			</p>

			<div className="bg-white p-3 w-full border border-gray-800 rounded-xl">
				{rejectionMsg}
			</div>

			<button className="py-3 px-2 rounded-xl bg-black text-white font-semibold hover:opacity-80 transition-all cursor-pointer active:scale-97"
      onClick={() => router.push('/partner/onboarding/vehicle')}
      >
				Update Documents/Details
			</button>
			<p className="text-sm text-gray-500 -mt-3 ml-1">or you can click on the step to update specific field</p>
		</motion.div>
	);
};

export default RejectionCard;
