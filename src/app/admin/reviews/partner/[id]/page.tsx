"use client";
import AnimatedCard from "@/components/AnimatedCard";
import { IPartnerBank } from "@/model/partnerBank.model";
import { IPartnerDocs } from "@/model/partnerDocs.model";
import { IUser } from "@/model/user.model";
import { IVehicle } from "@/model/vehicle.model";
import axios from "axios";
import { ArrowLeft, Car, CheckCircle2, Clock4, XCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

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
				<div className="lg:col-span-2 space-y-8">
          <AnimatedCard title="Vehicle Details" icon={<Car size={18}/>}>
          <div className="flex jusitfy-between text-sm">
            <span></span>
            <span></span>
          </div>
          </AnimatedCard>
        </div>
			</main>
		</div>
	);
};

export default Page;
