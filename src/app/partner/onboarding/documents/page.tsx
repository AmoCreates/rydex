"use client";
import React, { useState } from "react";
import { motion } from "motion/react";
import { RiArrowLeftLine } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { FileCheck, UploadCloud, File, Check, CircleDashed } from "lucide-react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/Toolkit/store";


const Page = () => {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [err, setErr] = useState("");
	const {userData} = useSelector((state: RootState) => state.user);

	type docsType = "aadhaar" | "license" | "rc" | "puc" | "motorInsurance";
	const [docs, setDocs] = useState<Record<docsType, File | null>>({
		aadhaar: null,
		license: null,
		rc: null,
		puc: null,
		motorInsurance: null,
	});

	const handleImg = (docs: docsType, file: File | null) => {
		if (!file) {
			return;
		}
		setDocs((prev) => ({
			...prev,
			[docs]: file,
		}));
	};

	const handleDocs = async () => {
		setIsLoading(true);
		setErr("");

		if (
			!docs.aadhaar ||
			!docs.license ||
			!docs.rc ||
			!docs.puc ||
			!docs.motorInsurance
		) {
			setErr("Please upload all documents");
			setIsLoading(false);
			return;
		}

		try {
			const formData = new FormData();
			formData.append("aadhaar", docs.aadhaar);
			formData.append("license", docs.license);
			formData.append("rc", docs.rc);
			formData.append("puc", docs.puc);
			formData.append("motorInsurance", docs.motorInsurance);
			const res = await axios.post(
				"/api/partner/onboarding/documents",
				formData,
			);
			if (res.status === 200) {
				router.push("/partner/onboarding/bank");
			} else {
				setErr("Something went wrong");
			}
		} catch (error: any) {
			const axiosError = error;
			const serverMessage = axiosError?.response?.data?.message;
			console.log(
				"vehicle submit error",
				axiosError?.response?.data || axiosError?.message || axiosError,
			);
			setErr(serverMessage || "Something went wrong");
		}
		setIsLoading(false);
	};

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
					<label
						htmlFor="aadhaar"
						className={`flex relative items-center justify-between p-4 rounded-2xl border transition hover:scale-102 ${docs.aadhaar ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-black"} ${isLoading ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
					>
						<div>
							<p className="text-sm font-semibold">
								Aadhaar / ID Proof <span className="text-red-500">*</span>
							</p>
							<p
								className={`truncate w-62.5 text-xs ${docs.aadhaar ? "text-green-600 font-medium" : "text-gray-500"}`}
							>
								{docs.aadhaar ? docs.aadhaar.name : "Government issued ID"}
							</p>
						</div>
						<div className="flex flex-col items-center gap-1">
							<span className=" text-xs text-gray-400">
								{docs.aadhaar ? (
									<span className="flex items-center gap-1">
										<Check size={15} /> Done
									</span>
								) : (
									"Upload"
								)}
							</span>
							<div
								className={`w-10 h-10 rounded-full flex items-center justify-center ${docs.aadhaar ? "bg-green-500" : "bg-black"} text-white`}
							>
								{docs.aadhaar ? <File /> : <UploadCloud />}
							</div>
						</div>
						<input
							type="file"
							id="aadhaar"
							accept="image/*, .pdf"
							onChange={(e) =>
								handleImg("aadhaar", e.target?.files?.[0] || null)
							}
							className="hidden"
							disabled={isLoading}
						/>
					</label>

					<label
						htmlFor="license"
						className={`flex items-center justify-between p-4 rounded-2xl border transition cursor-pointer hover:scale-102 ${docs.license ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-black"} ${isLoading ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
					>
						<div>
							<p className="text-sm font-semibold">
								Driving License <span className="text-red-500">*</span>
							</p>
							<p
								className={`truncate text-xs ${docs.license ? "text-green-600 font-medium" : "text-gray-500"}`}
							>
								{docs.license ? docs.license.name : "RTO/RTA issued ID"}
							</p>
						</div>
						<div className="flex flex-col items-center gap-1">
							<span className="text-xs text-gray-400">
								{docs.license ? (
									<span className="flex items-center gap-1">
										<Check size={15} /> Done
									</span>
								) : (
									"Upload"
								)}
							</span>
							<div
								className={`w-10 h-10 rounded-full flex items-center justify-center ${docs.license ? "bg-green-500" : "bg-black"} text-white`}
							>
								{docs.license ? <File /> : <UploadCloud />}
							</div>
						</div>

						<input
							type="file"
							id="license"
							accept="image/*, .pdf"
							onChange={(e) => {
								handleImg("license", e.target?.files?.[0] || null);
							}}
							className="hidden"
						/>
					</label>

					<label
						htmlFor="rc"
						className={`flex items-center justify-between p-4 rounded-2xl border transition cursor-pointer hover:scale-102 ${docs.rc ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-black"} ${isLoading ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
					>
						<div>
							<p className="text-sm font-semibold">
								Vehicle Registration Certificate(RC) <span className="text-red-500">*</span>
							</p>
							<p
								className={`truncate text-xs ${docs.rc ? "text-green-600 font-medium" : "text-gray-500"}`}
							>
								{docs.rc ? docs.rc.name : "MoRTH/RTO issued certificate"}
							</p>
						</div>
						<div className="flex flex-col items-center gap-1">
							<span className="text-xs text-gray-400">
								{docs.rc ? (
									<span className="flex items-center gap-1">
										<Check size={15} /> Done
									</span>
								) : (
									"Upload"
								)}
							</span>
							<div
								className={`w-10 h-10 rounded-full flex items-center justify-center ${docs.rc ? "bg-green-500" : "bg-black"} text-white`}
							>
								{docs.rc ? <File /> : <UploadCloud />}
							</div>
						</div>
						<input
							type="file"
							id="rc"
							accept="image/*, .pdf"
							onChange={(e) => handleImg("rc", e.target?.files?.[0] || null)}
							className="hidden"
						/>
					</label>

					<label
						htmlFor="puc"
						className={`flex items-center justify-between p-4 rounded-2xl border transition cursor-pointer hover:scale-102 ${docs.puc ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-black"} ${isLoading ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
					>
						<div>
							<p className="text-sm font-semibold">
								Pollution Under Control(PUC) <span className="text-red-500">*</span>
							</p>
							<p
								className={`truncate text-xs ${docs.puc ? "text-green-600 font-medium" : "text-gray-500"}`}
							>
								{docs.puc ? docs.puc.name : "MoRTH issued Certificate"}
							</p>
						</div>
						<div className="flex flex-col items-center gap-1">
							<span className="text-xs text-gray-400">
								{docs.puc ? (
									<span className="flex items-center gap-1">
										<Check size={15} /> Done
									</span>
								) : (
									"Upload"
								)}
							</span>
							<div
								className={`w-10 h-10 rounded-full flex items-center justify-center ${docs.puc ? "bg-green-500" : "bg-black"} text-white`}
							>
								{docs.puc ? <File /> : <UploadCloud />}
							</div>
						</div>
						<input
							type="file"
							id="puc"
							accept="image/*, .pdf"
							onChange={(e) => handleImg("puc", e.target?.files?.[0] || null)}
							className="hidden"
						/>
					</label>

					<label
						htmlFor="mic"
						className={`flex items-center justify-between p-4 rounded-2xl border transition cursor-pointer hover:scale-102 ${docs.motorInsurance ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-black"} ${isLoading ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
					>
						<div>
							<p className="text-sm font-semibold">
								Motor Insurance Certificate(MIC) <span className="text-red-500">*</span>
							</p>
							<p
								className={`truncate text-xs ${docs.motorInsurance ? "text-green-600 font-medium" : "text-gray-500"}`}
							>
								{docs.motorInsurance
									? docs.motorInsurance.name
									: "Authorized issued certificate"}
							</p>
						</div>
						<div className="flex flex-col items-center gap-1">
							<span className="text-xs text-gray-400">
								{docs.motorInsurance ? (
									<span className="flex items-center gap-1">
										<Check size={15} /> Done
									</span>
								) : (
									"Upload"
								)}
							</span>
							<div
								className={`w-10 h-10 rounded-full flex items-center justify-center ${docs.motorInsurance ? "bg-green-500" : "bg-black"} text-white`}
							>
								{docs.motorInsurance ? <File /> : <UploadCloud />}
							</div>
						</div>
						<input
							type="file"
							id="mic"
							accept="image/*, .pdf"
							onChange={(e) =>
								handleImg("motorInsurance", e.target?.files?.[0] || null)
							}
							className="hidden"
						/>
					</label>
				</div>

				<div className="mt-6 flex items-start gap-3 text-xs text-gray-500">
					<FileCheck size={16} className="text-green-500 mt-0.6" />
					<p>
						All related documents are securely stored and manually verified by
						our team.
					</p>
				</div>

				{err && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm"
					>
						<div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
						{err}
					</motion.div>
				)}

				<button
					type="submit"
					className="mt-5 w-full h-11 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 flex justify-center items-center gap-3 active:scale-95 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
					onClick={handleDocs}
					disabled={isLoading}
				>
					{isLoading ? (
						<>
							<CircleDashed className="w-5 h-5 text-white animate-spin" />
							<span>{(userData?.partnerOnBoardingStep ?? 0) >= 2 ? "Updating Documents..." :  "Uploading Documents..."}</span>
						</>
					) : (
						(userData?.partnerOnBoardingStep ?? 0) >= 2 ? "Update Documents" : "Submit Documents"
					)}
				</button>
			</motion.div>
		</div>
	);
};

export default Page;
