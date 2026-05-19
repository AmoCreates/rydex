"use client";
import { motion } from "motion/react";

const Footer = () => {
	return (
		<div className="w-full bg-black text-white md:px-8">
			<motion.div
				initial={{ opacity: 0, y: 40 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, ease: "easeOut" }}
				viewport={{ once: true }}
				className="max-w-7xl mx-auto px-6 py-16"
			>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
					<div>
						<h2 className="text-2xl font-bold tracking-tight">RYDEX</h2>
						<p className="mt-4 text-gray-400 text-sm leading-relaxed">
							book any vehicle - from bikes to trucks. Trusted owners.
							Transparent pricing.
						</p>
					</div>
				</div>
			</motion.div>
		</div>
	);
};

export default Footer;
