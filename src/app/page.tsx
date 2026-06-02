"use client";
import AdminDashboard from "@/components/AdminDashboard";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import PartnerDashboard from "@/components/PartnerDashboard";
import PublicHome from "@/components/PublicHome";
import { RootState } from "@/Toolkit/store";
import { useState } from "react";
import { useSelector } from "react-redux";

export default function Home() {
	const [authOpen, setAuthOpen] = useState(false);
	const { userData } = useSelector((state: RootState) => state.user);
	return (
		<div className="w-full min-h-screen bg-white">
			<Nav onOpen={() => setAuthOpen(true)} />
			{userData?.role === "partner" ? (
				<PartnerDashboard />
			) : userData?.role === "admin" ? (
				<AdminDashboard />
			) : (
				<PublicHome
					onOpen={() => setAuthOpen(true)}
					open={authOpen}
					onClose={() => setAuthOpen(false)}
				/>
			)}
			{userData?.role === "admin" && <AdminDashboard />}
			<Footer />
		</div>
	);
}
