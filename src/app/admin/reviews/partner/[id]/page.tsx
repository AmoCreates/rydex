"use client";
import AnimatedCard from "@/components/AnimatedCard";
import DocPreview from "@/components/DocPreview";
import { IPartnerBank } from "@/model/partnerBank.model";
import { IPartnerDocs } from "@/model/partnerDocs.model";
import { IUser } from "@/model/user.model";
import { IVehicle } from "@/model/vehicle.model";
import { RiFileTextLine } from "@remixicon/react";
import axios from "axios";
import {
	ArrowLeft,
	Car,
	CheckCircle2,
	Clock4,
	FileText,
	Landmark,
	ShieldCheck,
	XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";

const Page = () => {
	const { id } = useParams();
	const router = useRouter();
	const [partnerData, setPartnerData] = useState<IUser | null>(null);
	const [vehicleData, setVehicleData] = useState<IVehicle | null>(null);
	const [documentsData, setDocumentsData] = useState<IPartnerDocs | null>(null);
	const [bankData, setBankData] = useState<IPartnerBank | null>(null);
	const [loading, setLoading] = useState(false);
	const [err, setErr] = useState("");
	const approved = "bg-green-100 text-green-700 border border-green-200";
	const pending = "bg-amber-100 text-amber-700 border border-amber-200";
	const rejected = "bg-red-100 text-red-700 border border-red-200";
	useEffect(() => {
		const getPartner = async () => {
			try {
				const { data } = await axios.get(`/api/admin/reviews/partner/${id}`);
				console.log(data);
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
	}, []);
	return (
		<div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200">
			<div className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b">
				<div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
					<button
						className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100 transition"
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
			</div>
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
							<button className="py-3 rounded-2xl bg-linear-to-r from-black to-gray-800 text-white font-semibold hover:opacity-80 transition-all cursor-pointer active:scale-97">
								Approve To Continue
							</button>
							<button className="py-3 rounded-2xl bg-linear-to-r from-red-800 to-red-600 text-white font-semibold hover:opacity-80 transition-all cursor-pointer active:scale-97">
								Reject
							</button>
						</div>
					</motion.div>
				</div>
			</main>
		</div>
	);
};

export default Page;
