"use client";
import { motion } from "motion/react";
import { Bike, CheckCircle2, IndianRupee, UserRound } from "lucide-react";
import { PaymentStatus } from "@/model/booking.model";
import { useRouter } from "next/navigation";

const PAYMENT_BADGE: Record<PaymentStatus, { label: string; cls: string }> = {
	idle: { label: "N/A", cls: "bg-zinc-100 text-zinc-700" },
	pending: { label: "Pending", cls: "bg-amber-100 text-amber-700" },
	paid: { label: "Paid", cls: "bg-emerald-100 text-emerald-700" },
	failed: { label: "Failed", cls: "bg-red-100 text-red-700" },
};

const CompletedScreen = ({ booking, role }: { booking: any; role: string }) => {
  const router = useRouter();
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
			className="h-screen w-full bg-zinc-950 flex flex-col overflow-y-auto"
		>
			<div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
				{/* Completed Check Circle */}
				<motion.div
					initial={{ scale: 0.5, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
					className="mb-8"
				>
					<div className="w-32 h-32 rounded-full bg-emerald-400/10 flex items-center justify-center">
						<div className="w-24 h-24 rounded-full bg-emerald-400/20 flex items-center justify-center">
							<CheckCircle2
								size={52}
								className="text-emerald-400"
							/>
						</div>
					</div>
				</motion.div>
				{/* */}
				<motion.div
					initial={{ opacity: 0, y: 24 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2, duration: 0.5 }}
					className="w-full max-w-sm"
				>
					<p className="text-zinc-400 uppercase text-xs tracking-wide font-semibold text-center mb-2">
						Trip Completed
					</p>
					<h1 className="text-white text-3xl font-black text-center mb-1">
						Ride Completed !
					</h1>
					<p className="text-zinc-500 text-sm text-center mb-8">
						{role === "driver"
							? "You have successfully dropped the customer."
							: "You have successfully arrived at drop."}
					</p>

					{/* About Payment */}
					<div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-3">
						<p className="text-zinc-500 text-[10px] tracking-widest font-semibold uppercase mb-1 text-center">
							Fare Collected
						</p>
						<p className="text-white text-5xl font-black flex items-center justify-center gap-1 mb-4">
							<IndianRupee size={30} strokeWidth={2.5} />{" "}
							{booking.fare}
						</p>
						<div className="flex items-center justify-between text-xs border-t border-zinc-800 pt-3">
							<span className="text-zinc-500">
								Payment Status
							</span>
							<span
								className={`px-2.5 py-1 rounded-full font-semibold text-[11px] ${PAYMENT_BADGE[booking.paymentStatus]?.cls}`}
							>
								{PAYMENT_BADGE[booking.paymentStatus]?.label ??
									booking.paymentStatus}
							</span>
						</div>
					</div>
          
          {/* About Customer */}
					{booking.customer && role === "driver" && (
						<div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3 mb-3">
							<div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
								<UserRound
									size={20}
									className="text-zinc-400"
								/>
							</div>
							<div>
								<p className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">
									Customer
								</p>
								<p className="text-white text-sm font-bold">
									{booking.customer.name ?? "Customer"}
								</p>
							</div>
						</div>
					)}

          {/* About Driver */}
					{booking.driver && role === "customer" && (
						<div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3 mb-3">
							<div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
								<Bike
									size={20}
									className="text-zinc-400"
								/>
							</div>
							<div>
								<p className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">
									Driver
								</p>
								<p className="text-white text-sm font-bold">
									{booking.driver.name ?? "Customer"}
								</p>
							</div>
						</div>
					)}

          <button onClick={() => router.push('/')} className="w-full border border-zinc-700 text-zinc-400 py-3 rounded-2xl text-sm font-semibold hover:bg-zinc-900 transition-colors cursor-pointer">Back To Home</button>
				</motion.div>
			</div>
		</motion.div>
	);
};

export default CompletedScreen;
