"use client";
import React, { useState } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { RiArrowLeftLine, RiSecurePaymentFill } from "@remixicon/react";
import {
	BadgeCheck,
	CheckCircle,
	CircleDashed,
	CreditCard,
	Landmark,
	Phone,
} from "lucide-react";
import axios from "axios";

const Page = () => {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [err, setErr] = useState("");
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

	const IFSC_RAGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
	const [formData, setFormData] = useState({
		accountHolder: "",
		accountNumber: "",
		ifscCode: "",
		mobile: "",
		upi: "",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		if (fieldErrors[name]) {
			setFieldErrors((prev) => {
				const updated = { ...prev };
				delete updated[name];
				return updated;
			});
		}
	};
	
	const handleSubmit = async () => {
		setIsLoading(true);
		setErr("");
		setFieldErrors({});

		const errors: Record<string, string> = {};

		if (!formData.accountHolder) errors.accountHolder = "Required";
		else if (formData.accountHolder.length < 3 || formData.accountHolder.length > 35) {
			errors.accountHolder = "Must be 3-35 characters";
		}

		if (!formData.accountNumber) errors.accountNumber = "Required";
		else if (formData.accountNumber.length < 9 || formData.accountNumber.length > 18) {
			errors.accountNumber = "Must be 9-18 digits";
		}

		if (!formData.ifscCode) errors.ifscCode = "Required";
		else if (formData.ifscCode.length !== 11 || !IFSC_RAGEX.test(formData.ifscCode)) {
			errors.ifscCode = "Invalid IFSC format";
		}

		if (!formData.mobile) errors.mobile = "Required";
		else if (formData.mobile.length !== 10) {
			errors.mobile = "Invalid 10-digit number";
		}

		if (Object.keys(errors).length > 0) {
			setFieldErrors(errors);
			setIsLoading(false);
			return;
		}

		try {
			const res = await axios.post("/api/partner/onboarding/bank", formData);
			if (res.status === 200) {
				console.log("done")
			} else {
				setErr("Something went wrong");
			}
		} catch (error: any) {
			const serverMessage = error?.response?.data?.message;
			console.log(
				"bank setup error",
				error?.response?.data || error?.message || error,
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

					<p className="text-xs text-gray-500 font-medium">step 3 of 3</p>
					<h1 className="text-2xl font-bold mt-1">Bank & Payout Setup</h1>
					<p className="text-sm text-gray-500 mt-2 ">
						User for partner payouts
					</p>
				</div>

				<div className="mt-8 space-y-6">
					<div>
						<label
							htmlFor="ahn"
							className="text-sm font-semibold text-gray-500"
						>
							Account Holder Name <span className="text-red-500">*</span>
						</label>
						<div className="flex items-center gap-2 mt-2">
							<div className="text-gray-400">
								<BadgeCheck />
							</div>
							<input
								type="text"
								placeholder="As per bank records"
								id="ahn"
								name="accountHolder"
								value={formData.accountHolder}
								onChange={handleChange}
								disabled={isLoading}
								className={`flex-1 border-b pb-2 text-sm focus:outline-none border-gray-300 focus:border-black ${fieldErrors.accountHolder && "border-red-500 focus:border-red-500"} `}
							/>
						</div>
						{fieldErrors.accountHolder && (
							<p className="text-red-500 text-[10px] mt-1 ml-8">{fieldErrors.accountHolder}</p>
						)}
					</div>

					<div>
						<label htmlFor="an" className="text-sm font-semibold text-gray-500">
							Bank Account Number <span className="text-red-500">*</span>
						</label>
						<div className="flex items-center gap-2 mt-2">
							<div className="text-gray-400">
								<CreditCard />
							</div>
							<input
								type="text"
								placeholder="Enter account number"
								id="an"
								name="accountNumber"
								value={formData.accountNumber}
								onChange={handleChange}
								disabled={isLoading}
								className={`flex-1 border-b pb-2 text-sm focus:outline-none border-gray-300 focus:border-black ${fieldErrors.accountNumber && "border-red-500 focus:border-red-500"}`}
							/>
						</div>
						{fieldErrors.accountNumber && (
							<p className="text-red-500 text-[10px] mt-1 ml-8">{fieldErrors.accountNumber}</p>
						)}
					</div>

					<div>
						<label htmlFor="ic" className="text-sm font-semibold text-gray-500">
							IFSC Code <span className="text-red-500">*</span>
						</label>
						<div className="flex items-center gap-2 mt-2">
							<div className="text-gray-400">
								<Landmark />
							</div>
							<input
								type="text"
								placeholder="HDFC0000123"
								id="ic"
								name="ifscCode"
								value={formData.ifscCode.toUpperCase()}
								onChange={handleChange}
								disabled={isLoading}
								className={`flex-1 border-b pb-2 text-sm focus:outline-none border-gray-300 focus:border-black ${fieldErrors.ifscCode && "border-red-500 focus:border-red-500"}`}
							/>
						</div>
						{fieldErrors.ifscCode && (
							<p className="text-red-500 text-[10px] mt-1 ml-8">{fieldErrors.ifscCode}</p>
						)}
					</div>

					<div>
						<label htmlFor="mn" className="text-sm font-semibold text-gray-500">
							Mobile Number <span className="text-red-500">*</span>
						</label>
						<div className="flex items-center gap-2 mt-2">
							<div className="text-gray-400">
								<Phone />
							</div>
							<input
								type="number"
								placeholder="Enter 10 digit mobile number"
								id="mn"
								name="mobile"
								value={formData.mobile}
								onChange={handleChange}
								disabled={isLoading}
								className={`flex-1 border-b pb-2 text-sm focus:outline-none border-gray-300 focus:border-black ${fieldErrors.mobile && "border-red-500 focus:border-red-500"}`}
							/>
						</div>
						{fieldErrors.mobile && (
							<p className="text-red-500 text-[10px] mt-1 ml-8">{fieldErrors.mobile}</p>
						)}
					</div>

					<div>
						<label
							htmlFor="upi"
							className="text-sm font-semibold text-gray-500"
						>
							UPI ID (optional)
						</label>
						<div className="flex items-center gap-2 mt-2">
							<div className="text-gray-400">
								<RiSecurePaymentFill />
							</div>
							<input
								type="text"
								placeholder="yourname@upi"
								id="upi"
								name="upi"
								value={formData.upi}
								onChange={handleChange}
								disabled={isLoading}
								className="flex-1 border-b pb-2 text-sm focus:outline-none border-gray-300 focus:border-black"
							/>
						</div>
					</div>
				</div>

				<div className="mt-6 flex items-center gap-3 text-xs text-gray-500">
					<CheckCircle size={16} className="text-green-500 mt-0.6" />
					<p>
						Bank details are verified before first payout. This usually takes
						24-48 hours.
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
					onClick={handleSubmit}
					disabled={isLoading}
				>
					{isLoading ? (
						<>
							<CircleDashed className="w-5 h-5 text-white animate-spin" />
							<span>Submitting Details...</span>
						</>
					) : (
						"Final Submit"
					)}
				</button>
			</motion.div>
		</div>
	);
};

export default Page;