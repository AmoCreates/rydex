"use client";
import React from "react";
import { motion } from "motion/react";
import { RiArrowLeftLine } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { FileCheck, UploadCloud } from "lucide-react";

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

					<p className="text-xs text-gray-500 font-medium">step 2 of 3</p>
					<h1 className="text-2xl font-bold mt-1">Upload Documents</h1>
					<p className="text-sm text-gray-500 mt-2 ">
						Required for verification
					</p>
				</div>

				<div className="mt-8 space-y-6">
					<div className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 cursor-pointer hover:border-black hover:scale-102 transition">
						<div>
							<p className="text-sm font-semibold">Aadhaar / ID Proof</p>
							<p className="text-xs text-gray-500">Government issued ID</p>
						</div>
						<div>
							<span className="text-xs text-gray-400">Upload</span>
							<div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
								<UploadCloud />
							</div>
						</div>
					</div>

					<div className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 cursor-pointer hover:border-black hover:scale-102 transition">
						<div>
							<p className="text-sm font-semibold">Driving License</p>
							<p className="text-xs text-gray-500">RTO/RTA issued ID</p>
						</div>
						<div>
							<span className="text-xs text-gray-400">Upload</span>
							<div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
								<UploadCloud />
							</div>
						</div>
					</div>

					<div className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 cursor-pointer hover:border-black hover:scale-102 transition">
						<div>
							<p className="text-sm font-semibold">
								Vehicle Registration Certificate(RC)
							</p>
							<p className="text-xs text-gray-500">
								MoRTH/RTO issued certificate
							</p>
						</div>
						<div>
							<span className="text-xs text-gray-400">Upload</span>
							<div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
								<UploadCloud />
							</div>
						</div>
					</div>

					<div className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 cursor-pointer hover:border-black hover:scale-102 transition">
						<div>
							<p className="text-sm font-semibold">
								Pollution Under Control(PUC)
							</p>
							<p className="text-xs text-gray-500">MoRTH issued Certificate</p>
						</div>
						<div>
							<span className="text-xs text-gray-400">Upload</span>
							<div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
								<UploadCloud />
							</div>
						</div>
					</div>

					<div className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 cursor-pointer hover:border-black hover:scale-102 transition">
						<div>
							<p className="text-sm font-semibold">
								Motor Insurance Certificate(MIC)
							</p>
							<p className="text-xs text-gray-500">
								Authorized issued certificate
							</p>
						</div>
						<div>
							<span className="text-xs text-gray-400">Upload</span>
							<div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
								<UploadCloud />
							</div>
						</div>
					</div>
				</div>

				<div className="mt-6 flex items-start gap-3 text-xs text-gray-500">
					<FileCheck size={16} className="text-green-500 mt-0.6" />
					<p>All related documents are securely stored and manually verified by our team.</p>
				</div>

				<button
					type="submit"
					className="mt-5 w-full h-11 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 flex justify-center items-center gap-3 active:scale-95 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
					onClick={() => router.push("/partner/onboarding/bank")}
				>
					Continue
				</button>
			</motion.div>
		</div>
	);
};

export default Page;
