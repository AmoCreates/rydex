"use client";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { RiArrowLeftLine, RiSecurePaymentFill } from "@remixicon/react";
import { BadgeCheck, CreditCard, Landmark, Phone } from "lucide-react";

const Page = () => {
	const router = useRouter();
	return (
		<div className="min-h-screen bg-white flex items-center justify-center px-4">
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="w-full max-w-xl bg-white rounded-3xl border border-gray-200 shadow-[0_25px_70px_rgba(0,0,0,0.15)] p-6 sm:p-8"
			>
				<div className="relative text-center">
					<button
						className="absolute left-0 top-0 w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-all cursor-pointer"
						onClick={() => router.back()}
					>
						<RiArrowLeftLine />
					</button>

					<p className="text-xs text-gray-500 font-medium">step 3 of 3</p>
					<h1 className="text-2xl font-bold mt-1">Bank & Payout Setup</h1>
					<p className="text-sm text-gray-500 mt-2 ">
						User for partner payouts
					</p>
				</div>

				<div className="mt-8 space-y-6">
					<label htmlFor="ahn" className="text-sm font-semibold text-gray-500">
						Account Holder Name
					</label>
					<div className="flex items-center gap-2 mt-2">
						<div className="text-gray-400">
							<BadgeCheck />
						</div>
						<input
							type="text"
							placeholder="As per bank records"
							id="ahn"
							className="flex-1 border-b pb-2 text-sm focus:outline-none border-gray-300 focus:border-black"
						/>
					</div>
				</div>

				<div className="mt-8 space-y-6">
					<label htmlFor="an" className="text-sm font-semibold text-gray-500">
						Account Number
					</label>
					<div className="flex items-center gap-2 mt-2">
						<div className="text-gray-400">
							<CreditCard/>
						</div>
						<input
							type="text"
							placeholder="Enter account number"
							id="an"
							className="flex-1 border-b pb-2 text-sm focus:outline-none border-gray-300 focus:border-black"
						/>
					</div>
				</div>

				<div className="mt-8 space-y-6">
					<label htmlFor="ic" className="text-sm font-semibold text-gray-500">
						IFSC Code
					</label>
					<div className="flex items-center gap-2 mt-2">
						<div className="text-gray-400">
							<Landmark />
						</div>
						<input
							type="text"
							placeholder="HDFC0000123"
							id="ic"
							className="flex-1 border-b pb-2 text-sm focus:outline-none border-gray-300 focus:border-black"
						/>
					</div>
				</div>

				<div className="mt-8 space-y-6">
					<label htmlFor="mn" className="text-sm font-semibold text-gray-500">
						Mobile Number
					</label>
					<div className="flex items-center gap-2 mt-2">
						<div className="text-gray-400">
							<Phone/>
						</div>
						<input
							type="number"
							placeholder="0123456789"
							id="mn"
							className="flex-1 border-b pb-2 text-sm focus:outline-none border-gray-300 focus:border-black"
						/>
					</div>
				</div>

				<div className="mt-8 space-y-6">
					<label htmlFor="upi" className="text-sm font-semibold text-gray-500">
						UPI ID (optional)
					</label>
					<div className="flex items-center gap-2 mt-2">
						<div className="text-gray-400">
							<RiSecurePaymentFill/>
						</div>
						<input
							type="text"
							placeholder="yourname@upi"
							id="upi"
							className="flex-1 border-b pb-2 text-sm focus:outline-none border-gray-300 focus:border-black"
						/>
					</div>
				</div>

        <button
					type="submit"
					className="mt-5 w-full h-11 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 flex justify-center items-center gap-3 active:scale-95 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
					onClick={() => router.push("/partner/onboarding/bank")}
				>
					Submit
				</button>
			</motion.div>
		</div>
	);
};

export default Page;
