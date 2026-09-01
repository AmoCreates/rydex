"use client";
import React, { useState } from "react";
import { motion } from "motion/react";
import {
	Mail,
	Send,
	Check,
	Copy,
	MessageSquare,
	Sparkles,
	HelpCircle,
	ExternalLink,
	User,
} from "lucide-react";
import { RiGithubFill, RiLinkedinFill } from "@remixicon/react";
import Nav from "@/components/Nav";
import AuthModel from "@/components/AuthModel";
import Footer from "@/components/Footer";

const faqs = [
	{
		q: "How do I become a vehicle partner on RYDEX?",
		a: "You can sign up as a partner from the navbar or profile menu, fill in your basic profile, register your vehicle details, upload document proofs, and complete Video KYC verification.",
	},
	{
		q: "What types of vehicles can I book?",
		a: "RYDEX supports 2-wheelers (bikes), 3-wheelers (autos), 4-wheelers (cars), small loading trucks, heavy transport trucks, and passenger buses.",
	},
	{
		q: "How is ride pricing calculated?",
		a: "Prices are calculated based on vehicle type, distance, and direct owner rates without hidden platform surges.",
	},
	{
		q: "Who should I contact for technical or business inquiries?",
		a: "You can reach out directly to founder & developer Anmol Maurya (Amy) via email at anmolmaurya.in@outlook.com or through LinkedIn / GitHub links provided on this page.",
	},
];

const ContactPage = () => {
	const [authOpen, setAuthOpen] = useState(false);
	const [copied, setCopied] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		subject: "General Inquiry",
		message: "",
	});

	const copyEmail = () => {
		navigator.clipboard.writeText("anmolmaurya.in@outlook.com");
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.name || !formData.email || !formData.message) return;
		setLoading(true);

		try {
			const response = await fetch("/api/contact/send", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to send email");
			}

			setSubmitted(true);
			setFormData({
				name: "",
				email: "",
				subject: "General Inquiry",
				message: "",
			});
		} catch (error) {
			console.error("Error sending message:", error);
			alert(
				error instanceof Error
					? error.message
					: "Failed to send message. Please try again."
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="w-full min-h-screen bg-black text-white flex flex-col selection:bg-white selection:text-black">
			{/* Navbar */}
			<Nav onOpen={() => setAuthOpen(true)} />

			{/* Main Content */}
			<main className="flex-1 pt-28 pb-20">
				{/* Hero Section */}
				<section className="relative px-6 md:px-12 max-w-7xl mx-auto text-center pt-10 pb-12">
					<div className="absolute inset-0 -z-10 flex items-center justify-center">
						<div className="w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
					</div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs font-semibold uppercase tracking-widest text-gray-300 mb-6"
					>
						<Sparkles size={14} className="text-emerald-400" />
						Get In Touch
					</motion.div>

					<motion.h1
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.1 }}
						className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight"
					>
						We&#39;d Love to <br className="hidden sm:block" />
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-500">
							Connect With You
						</span>
					</motion.h1>

					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="mt-6 text-gray-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
					>
						Have questions, feedback, or partnership proposals? Connect directly with the developer and team behind RYDEX.
					</motion.p>
				</section>

				{/* Main Content Grid: Developer Info + Contact Form */}
				<section className="px-6 md:px-12 max-w-7xl mx-auto my-10">
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
						{/* Developer & Contact Info Card (5 cols) */}
						<motion.div
							initial={{ opacity: 0, x: -30 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							className="lg:col-span-5 p-8 sm:p-10 rounded-3xl bg-zinc-900/90 border border-white/10 flex flex-col justify-between relative overflow-hidden"
						>
							<div>
								<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6">
									Founder & Developer
								</div>

								<h2 className="text-2xl sm:text-3xl font-extrabold text-white">
									Anmol Maurya (Amy)
								</h2>
								<p className="text-gray-400 text-xs sm:text-sm mt-1">
									Full-Stack Engineer & Creator of RYDEX
								</p>

								<p className="mt-6 text-gray-300 text-sm leading-relaxed border-t border-white/10 pt-6">
									Building scalable web applications, real-time mobility solutions, and multi-vendor platforms with Next.js, React, and modern backend architectures.
								</p>

								{/* Contact Channels */}
								<div className="mt-8 space-y-4">
									{/* Email */}
									<div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-center justify-between group">
										<div className="flex items-center gap-3 min-w-0">
											<div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
												<Mail size={18} />
											</div>
											<div className="min-w-0">
												<p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
													Email Address
												</p>
												<a
													href="mailto:anmolmaurya.in@outlook.com"
													className="text-sm font-semibold text-white hover:underline truncate block"
												>
													anmolmaurya.in@outlook.com
												</a>
											</div>
										</div>
										<button
											onClick={copyEmail}
											title="Copy Email"
											className="p-2 rounded-lg bg-white/10 text-gray-300 hover:text-white hover:bg-white/20 transition cursor-pointer shrink-0 ml-2"
										>
											{copied ? (
												<Check size={16} className="text-emerald-400" />
											) : (
												<Copy size={16} />
											)}
										</button>
									</div>

									{/* GitHub */}
									<a
										href="https://github.com/AmoCreates"
										target="_blank"
										rel="noopener noreferrer"
										className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-center justify-between group"
									>
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
												<RiGithubFill size={22} />
											</div>
											<div>
												<p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
													GitHub Profile
												</p>
												<p className="text-sm font-semibold text-white group-hover:underline">
													github.com/AmoCreates
												</p>
											</div>
										</div>
										<ExternalLink size={16} className="text-gray-400 group-hover:text-white transition" />
									</a>

									{/* LinkedIn */}
									<a
										href="https://linkedin.com/in/anmolmaurya"
										target="_blank"
										rel="noopener noreferrer"
										className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-center justify-between group"
									>
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
												<RiLinkedinFill size={22} />
											</div>
											<div>
												<p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
													LinkedIn Profile
												</p>
												<p className="text-sm font-semibold text-white group-hover:underline">
													linkedin.com/in/anmolmaurya
												</p>
											</div>
										</div>
										<ExternalLink size={16} className="text-gray-400 group-hover:text-white transition" />
									</a>
								</div>
							</div>
						</motion.div>

						{/* Contact Form Card (7 cols) */}
						<motion.div
							initial={{ opacity: 0, x: 30 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.6, delay: 0.3 }}
							className="lg:col-span-7 p-8 sm:p-10 rounded-3xl bg-zinc-900/90 border border-white/10 relative overflow-hidden"
						>
							<div className="flex items-center gap-3 mb-6">
								<div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
									<MessageSquare size={20} />
								</div>
								<div>
									<h2 className="text-2xl font-bold text-white">
										Send a Message
									</h2>
									<p className="text-xs text-gray-400">
										Fill out the form below and we&#39;ll get back to you shortly.
									</p>
								</div>
							</div>

							{submitted ? (
								<motion.div
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									className="p-8 rounded-2xl bg-white/5 border border-emerald-500/30 text-center my-10"
								>
									<div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
										<Check size={28} />
									</div>
									<h3 className="text-xl font-bold text-white">
										Thank You!
									</h3>
									<p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
										Your message has been received successfully. We will get in touch with you at the earliest opportunity.
									</p>
									<button
										onClick={() => setSubmitted(false)}
										className="mt-6 px-6 py-2.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-gray-200 transition cursor-pointer"
									>
										Send Another Message
									</button>
								</motion.div>
							) : (
								<form onSubmit={handleSubmit} className="space-y-4 mt-6">
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<div>
											<label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
												Your Name <span className="text-red-400">*</span>
											</label>
											<div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-white focus-within:bg-white/10 transition">
												<User size={18} className="text-gray-400" />
												<input
													type="text"
													required
													placeholder="John Doe"
													value={formData.name}
													onChange={(e) =>
														setFormData({ ...formData, name: e.target.value })
													}
													className="w-full bg-transparent outline-none text-sm text-white placeholder:text-gray-500"
												/>
											</div>
										</div>

										<div>
											<label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
												Email Address <span className="text-red-400">*</span>
											</label>
											<div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-white focus-within:bg-white/10 transition">
												<Mail size={18} className="text-gray-400" />
												<input
													type="email"
													required
													placeholder="john@example.com"
													value={formData.email}
													onChange={(e) =>
														setFormData({ ...formData, email: e.target.value })
													}
													className="w-full bg-transparent outline-none text-sm text-white placeholder:text-gray-500"
												/>
											</div>
										</div>
									</div>

									<div>
										<label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
											Inquiry Type
										</label>
										<select
											value={formData.subject}
											onChange={(e) =>
												setFormData({ ...formData, subject: e.target.value })
											}
											className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-4 py-3 outline-none text-sm text-white focus:border-white transition"
										>
											<option value="General Inquiry">General Inquiry</option>
											<option value="Vehicle Partner Support">
												Vehicle Partner Support
											</option>
											<option value="Ride Booking Issue">Ride Booking Issue</option>
											<option value="Business Partnership">
												Business Partnership
											</option>
										</select>
									</div>

									<div>
										<label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
											Your Message <span className="text-red-400">*</span>
										</label>
										<textarea
											required
											rows={4}
											placeholder="Write your message or inquiry here..."
											value={formData.message}
											onChange={(e) =>
												setFormData({ ...formData, message: e.target.value })
											}
											className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none text-sm text-white placeholder:text-gray-500 focus:border-white focus:bg-white/10 transition resize-none"
										/>
									</div>

									<button
										type="submit"
										disabled={loading}
										className="w-full h-12 rounded-2xl bg-white text-black font-semibold text-sm hover:bg-gray-200 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
									>
										{loading ? (
											"Sending Message..."
										) : (
											<>
												Send Message <Send size={16} />
											</>
										)}
									</button>
								</form>
							)}
						</motion.div>
					</div>
				</section>

				{/* FAQ Section */}
				<section className="px-6 md:px-12 max-w-7xl mx-auto mt-20">
					<div className="text-center max-w-2xl mx-auto mb-12">
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-gray-300 mb-3">
							<HelpCircle size={14} /> FAQ
						</div>
						<h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
							Frequently Asked Questions
						</h2>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{faqs.map((faq, idx) => (
							<motion.div
								key={idx}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.4, delay: idx * 0.1 }}
								className="p-6 rounded-3xl bg-zinc-900/60 border border-white/10 hover:border-white/20 transition-all"
							>
								<h3 className="text-base font-bold text-white mb-2">
									{faq.q}
								</h3>
								<p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
									{faq.a}
								</p>
							</motion.div>
						))}
					</div>
				</section>
			</main>

			{/* Auth Modal */}
			<AuthModel open={authOpen} onClose={() => setAuthOpen(false)} />

			{/* Footer */}
			<Footer />
		</div>
	);
};

export default ContactPage;
