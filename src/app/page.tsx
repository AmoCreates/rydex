"use client";
import AdminDashboard from "@/components/AdminDashboard";
import Footer from "@/components/Footer";
import GeoUpdater from "@/components/GeoUpdater";
import Nav from "@/components/Nav";
import PartnerDashboard from "@/components/PartnerDashboard";
import PublicHome from "@/components/PublicHome";
import { RootState } from "@/Toolkit/store";
import { useState } from "react";
import { useSelector } from "react-redux";

export default function Home() {
	const [authOpen, setAuthOpen] = useState(false);
	const { userData } = useSelector((state: RootState) => state.user);
	const role = userData?.role;
	return (
		<div className="w-full min-h-screen bg-white">
			{userData?._id && <GeoUpdater userId={String(userData._id)} />}
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
