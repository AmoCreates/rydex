"use client";
import { RiUserSettingsFill, RiUserSettingsLine } from "@remixicon/react";
import axios from "axios";
import { User } from "lucide-react";
import Image from "next/image";
import React, { useEffect } from "react";

const AdminDashboard = () => {
	useEffect(() => {
		const fetchData = async () => {
			try {
				const { data } = await axios.get("/api/admin/dashboard");
				console.log(data);
			} catch (error) {
				console.log(error);
			}
		};

		fetchData();
	}, []);

	return (
		<div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200">
			<div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b z-40">
				<div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Image
							src="/logo.png"
							width={44}
							height={44}
							alt="logo"
							priority
							className="w-auto h-auto"
						/>
					</div>
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-black text-white ">
            <RiUserSettingsLine size={17} />
            Admin Dashboard</div>
				</div>
			</div>
		</div>
	);
};

export default AdminDashboard;
