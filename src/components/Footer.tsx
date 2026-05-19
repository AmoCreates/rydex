"use client";
import { RiCopyrightLine, RiInstagramFill, RiLinkedinFill, RiTelegram2Fill, RiTwitterXFill, RiWhatsappFill, RiYoutubeFill } from "@remixicon/react";
import { motion } from "motion/react";

const Footer = () => {
	const socialMedia = [RiInstagramFill, RiWhatsappFill, RiTelegram2Fill, RiYoutubeFill, RiTwitterXFill, RiLinkedinFill]
	return (
		<div className="w-full bg-black text-white md:px-8">
			<motion.div
				initial={{ opacity: 0, y: 40 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, ease: "easeOut" }}
				viewport={{ once: true }}
				className="max-w-7xl mx-auto px-6 pt-16 pb-5"
			>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
					<div>
						<h2 className="text-2xl font-bold tracking-tight">RYDEX</h2>
						<p className="mt-4 text-gray-400 text-sm leading-relaxed">
							book any vehicle - from bikes to trucks. Trusted owners.
							Transparent pricing.
						</p>

						<div className="flex gap-3 mt-4">
							{socialMedia.map((Icon, key) => (
							<motion.a key={key}
							whileHover={{y: -6}}
							transition={{ duration: 0.1, ease: "easeOut"}}
							href="#"
							className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 hover:bg-white hover:text-black transition"
							>
								<Icon size={24} />

							</motion.a>
						))}
						</div>
					</div>
				</div>

				<div className="mt-5 border-t border-white/10">
						<p className="flex flex-col gap-2 max-w-7xl mx-auto px-6 pt-6 justify-between items-center text-xs text-gray-500"><RiCopyrightLine/> {new Date().getFullYear()} RYDEX. All rights reserved.</p>
				</div>

			</motion.div>
		</div>
	);
};

export default Footer;
