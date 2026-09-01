"use client";
import AdminDashboard from "@/components/AdminDashboard";
import Footer from "@/components/Footer";
import GeoUpdater from "@/components/GeoUpdater";
import Nav from "@/components/Nav";
import PartnerDashboard from "@/components/PartnerDashboard";
import PublicHome from "@/components/PublicHome";
import { RootState } from "@/Toolkit/store";
import { Suspense, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";

function HomeContent() {
	const [authOpen, setAuthOpen] = useState(false);
	const { userData } = useSelector((state: RootState) => state.user);
	const role = userData?.role;
	const searchParams = useSearchParams();

	useEffect(() => {
		if (searchParams.get("auth") === "true") {
			setAuthOpen(true);
		}
	}, [searchParams]);

	return (
		<div className="w-full min-h-screen bg-white">
			{userData?.role !== "admin" && userData?._id && (
				<GeoUpdater userId={String(userData._id)} />
			)}
			
			{role !== "admin" && <Nav onOpen={() => setAuthOpen(true)} />}

			{role === "partner" ? (
				<PartnerDashboard />
			) : role === "admin" ? (
				<AdminDashboard />
			) : (
				<PublicHome
					onOpen={() => setAuthOpen(true)}
					open={authOpen}
					onClose={() => setAuthOpen(false)}
				/>
			)}

			<Footer />
		</div>
	);
}

export default function Home() {
	return (
		<Suspense fallback={null}>
			<HomeContent />
		</Suspense>
	);
}
