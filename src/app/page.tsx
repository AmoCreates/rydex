"use client";
import AdminDashboard from "@/components/AdminDashboard";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import PartnerDashboard from "@/components/PartnerDashboard";
import PublicHome from "@/components/PublicHome";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function Home() {
	const [authOpen, setAuthOpen] = useState(false);
	const { data: session } = useSession();
	const role = session?.user?.role;

	return (
		<div className="w-full min-h-screen bg-white">
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
