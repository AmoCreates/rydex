"use client";
import React from "react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Nav_Items = ["Home", "Bookings", "About Us", "Contact Us"];

const Nav = () => {
	const pathName = usePathname();
	return (
		<motion.div
			initial={{ y: -60, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			className={`fixed top-3 left-1/2 select-none -translate-x-1/2 w-[94%] md:w-[86%] z-50 rounded-full bg-[#0b0b0b] text-white shadow-[0_15px_50px_rgba(0,0,0,0.7)] py-3`}
		>
			<div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
				<Link href="/" className="flex items-center justify-center cursor-pointer" ><Image src="/logo.png" width={44} height={44} alt="logo" priority /></Link>
				<div className="hidden md:flex items-center gap-4 lg:gap-10">
					{Nav_Items.map((item, index) => {
						const href = item !== "Home" ? `/${item.toLowerCase()}` : "/";
						const active = pathName === href;
						return (
							<Link
								key={index}
								href={href}
								className={`text-sm font-medium transition pl-2 ${active ? "text-white" : "text-gray-400 hover:text-white"}`}
							>
								{item}
							</Link>
						);
					})}
				</div>

        <button className="px-4 py-1.5 rounded-full bg-white text-black text-sm"
        >Login</button>
			</div>
		</motion.div>
	);
};

export default Nav;
