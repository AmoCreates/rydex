"use client";
import AnimatedCard from "@/components/AnimatedCard";
import DocPreview from "@/components/DocPreview";
import { IPartnerBank } from "@/model/partnerBank.model";
import { IPartnerDocs } from "@/model/partnerDocs.model";
import { IUser } from "@/model/user.model";
import { IVehicle } from "@/model/vehicle.model";
import axios from "axios";
import {
	ArrowLeft,
	Car,
	CheckCircle2,
	Clock4,
	FileText,
	Info,
	Landmark,
	ShieldCheck,
	XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const Page = () => {
	const { id } = useParams();
	const router = useRouter();
	const [partnerData, setPartnerData] = useState<IUser | null>(null);
	const [vehicleData, setVehicleData] = useState<IVehicle | null>(null);
	const [documentsData, setDocumentsData] = useState<IPartnerDocs | null>(null);
	const [bankData, setBankData] = useState<IPartnerBank | null>(null);
	const [adminCheck, setAdminCheck] = useState<boolean | null>(null);
	const [loading, setLoading] = useState(false);
	const [err, setErr] = useState("");
	const [rejectionReason, setRejectionReason] = useState("");
	const approved = "bg-green-100 text-green-700 border border-green-200";
	const pending = "bg-amber-100 text-amber-700 border border-amber-200";
	const rejected = "bg-red-100 text-red-700 border border-red-200";
	useEffect(() => {
		const getPartner = async () => {
			try {
				const { data } = await axios.get(`/api/admin/reviews/partner/${id}`);
				setPartnerData(data.partner);
				setVehicleData(data.vehicle);
				setDocumentsData(data.documents);
				setBankData(data.bank);
				setLoading(false);
			} catch (error) {
				console.log(error);
			}
		};
		getPartner();
	}, [id]);

	const handleDecision = async () => {
		setLoading(true);
		try {
			await axios.put(`/api/admin/reviews/partner/${id}/approve`, {
				partnerStatus: adminCheck ? "approved" : "rejected",
				reason: adminCheck ? "" : rejectionReason,
			});
			router.push('/')
		} catch (error: any) {
			setErr(error.response?.data?.message || "Something went wrong");
			console.log(error.response?.data?.message)
		} finally {
			setLoading(false);
			setAdminCheck(null);
			setRejectionReason("");
		}
	};

	return (
		<div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200">
			<header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b">
				<div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
					<button
						className="w-10 h-10 rounded-full cursor-pointer border flex items-center justify-center hover:bg-gray-100 transition"
						onClick={() => router.back()}
					>
						<ArrowLeft />
					</button>
					<div className="flex-1 ">
						<div className="font-semibold text-lg">{partnerData?.name}</div>
						<div className="text-gray-500 text-xs">{partnerData?.email}</div>
					</div>
					<div
						className={`${partnerData?.partnerStatus === "approved" ? approved : partnerData?.partnerStatus === "pending" ? pending : rejected} py-1 px-2 rounded-full font-semibold text-xs text-center capitalize flex items-center justify-center gap-2`}
					>
						{partnerData?.partnerStatus === "pending" ? (
							<Clock4 size={14} />
						) : partnerData?.partnerStatus === "rejected" ? (
							<XCircle size={14} />
						) : (
							<CheckCircle2 size={14} />
						)}{" "}
						{partnerData?.partnerStatus}
					</div>
				</div>
			</header>

			<main className="max-w-7xl mx-auto px-4 py-12 grid lg:grid-cols-3 gap-10">
				{/* Left: Vehicle Details & Documents*/}
				<div className="lg:col-span-2 space-y-8">
					{/*Vehicle Details*/}
					<AnimatedCard title="Vehicle Details" icon={<Car size={18} />}>
						<div className="flex justify-between items-center text-sm capitalize">
							<span className="text-gray-500">Vehicle Type</span>
							<span className="font-semibold">
								{vehicleData?.type || "N/A"}
							</span>
						</div>
						<div className="flex justify-between items-center text-sm capitalize">
							<span className="text-gray-500">Registration Number</span>
							<span className="font-semibold">
								{vehicleData?.vehicleNumber || "N/A"}
							</span>
						</div>
						<div className="flex justify-between items-center text-sm capitalize">
							<span className="text-gray-500">Model</span>
							<span className="font-semibold">
								{vehicleData?.vehicleModel || "N/A"}
							</span>
						</div>
						<div className="flex justify-between items-center text-sm capitalize">
							<span className="text-gray-500">AC Availability</span>
							<span className="font-semibold">
								{vehicleData?.AC ? "True" : "False"}
							</span>
						</div>
					</AnimatedCard>

					{/*Documents*/}
					<AnimatedCard title="Documents" icon={<FileText size={18} />}>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
							<DocPreview
								label="Aadhaar Card"
								url={documentsData?.aadhaarUrl}
							/>
							<DocPreview
								label="Driving License"
								url={documentsData?.licenseUrl}
							/>
							<DocPreview
								label="Registration Certificate"
								url={documentsData?.rcUrl}
							/>
							<DocPreview
								label="Pollution Certificate"
								url={documentsData?.pucUrl}
							/>
							<DocPreview
								label="Motor Insurance"
								url={documentsData?.motorInsuranceUrl}
							/>
						</div>
					</AnimatedCard>
				</div>

				{/* Right: Bank Detials & Admin Decision*/}
				<div className="space-y-8">
					{/*Bank Details*/}
					<AnimatedCard title="Bank Details" icon={<Landmark size={18} />}>
						<div className="flex justify-between items-center text-sm capitalize">
							<span className="text-gray-500">Account Holder</span>
							<span className="font-semibold">
								{bankData?.accountHolder || "N/A"}
							</span>
						</div>
						<div className="flex justify-between items-center text-sm capitalize">
							<span className="text-gray-500">Account Number</span>
							<span className="font-semibold">
								{bankData?.accountNumber || "N/A"}
							</span>
						</div>
						<div className="flex justify-between items-center text-sm capitalize">
							<span className="text-gray-500">IFSC Code</span>
							<span className="font-semibold">
								{bankData?.ifscCode || "N/A"}
							</span>
						</div>
						<div className="flex justify-between items-center text-sm ">
							<span className="text-gray-500 capitalize">UPI</span>
							<span className="font-semibold">{bankData?.upi || "N/A"}</span>
						</div>
					</AnimatedCard>

					{/*Admin Decision*/}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className="bg-white rounded-4xl p-8 space-y-6"
					>
						<div className="flex items-center gap-2 font-semibold">
							<ShieldCheck size={18} />
							Admin Check
						</div>
						<p className="text-sm text-gray-500 -mt-2">
							Verify documents carefully before approving.
						</p>
						<div className="flex flex-col gap-4">
							<button className="py-3 rounded-2xl bg-linear-to-r from-black to-gray-800 text-white font-semibold hover:opacity-80 transition-all cursor-pointer active:scale-97"
							onClick={() => setAdminCheck(true)}>
								Approve To Continue
							</button>
							<button className="py-3 rounded-2xl bg-linear-to-r from-red-800 to-red-600 text-white font-semibold hover:opacity-80 transition-all cursor-pointer active:scale-97" onClick={() => setAdminCheck(false)}>
								Reject
							</button>
						</div>
					</motion.div>
				</div>

				{/*Admin Check Confirmation Popup*/}
				<AnimatePresence>
					{adminCheck !== null && (
						<div className="fixed inset-0 z-100 flex items-center justify-center p-4">
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="absolute inset-0 bg-black/60 backdrop-blur-sm"
								onClick={() => setAdminCheck(null)}
							/>
							<motion.div
								initial={{ scale: 0.9, opacity: 0, y: 20 }}
								animate={{ scale: 1, opacity: 1, y: 0 }}
								exit={{ scale: 0.9, opacity: 0, y: 20 }}
								className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6"
							>
								<div className="flex items-center gap-3">
									<div className={`p-3 rounded-2xl ${adminCheck ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
										{adminCheck ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
									</div>
									<div>
										<h3 className="text-xl font-bold">
											{adminCheck ? "Approve Partner" : "Reject Partner"}
										</h3>
										<p className="text-sm text-gray-500">
											{adminCheck 
												? "This will move the partner to the next stage (Video KYC). Admin must ensure that he have successfully verified all the necessary partner details. "
												: "Please provide a reason for rejection."}
										</p>
									</div>
								</div>

								{!adminCheck && (
									<div className="space-y-2">
										<label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
											<Info size={14} /> Rejection Reason
										</label>
										<textarea
											className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm outline-none focus:ring-2 ring-red-500/20 transition-all min-h-32"
											placeholder="Explain why the documents were rejected..."
											value={rejectionReason}
											onChange={(e) => setRejectionReason(e.target.value)}
										/>
									</div>
								)}


								<div className="flex gap-3 pt-2">
									<button
										className="flex-1 py-3 rounded-xl font-semibold text-black bg-gray-300 hover:bg-gray-100 transition-colors cursor-pointer"
										onClick={() => setAdminCheck(null)}
									>
										Cancel
									</button>
									<button
										disabled={loading || (!adminCheck && !rejectionReason)}
										className={`flex-1 py-3 rounded-xl font-semibold text-white transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
											adminCheck ? "bg-black" : "bg-red-600"
										}`}
										onClick={handleDecision}
									>
										{loading ? "Processing..." : adminCheck ? "Yes, Approve" : "Confirm Rejection"}
									</button>
								</div>
							</motion.div>
						</div>
					)}
				</AnimatePresence>

			</main>
		</div>
	);
};

export default Page;
