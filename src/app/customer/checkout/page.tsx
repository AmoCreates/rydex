"use client";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
	ArrowLeft,
	Banknote,
	Bike,
	Bus,
	Car,
	CheckCircle,
	Clock4,
	CreditCard,
	IndianRupee,
	Loader2,
	MapPin,
	Package,
	ShieldCheck,
	Truck,
	Wallet,
	XCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { RiArrowRightSLine, RiSendPlaneFill } from "@remixicon/react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/Toolkit/store";

const VEHICE_META: any = {
	bike: { label: "Bike", Icon: Bike },
	auto: { label: "Auto", Icon: Car },
	car: { label: "Car", Icon: Car },
	loading: { label: "Loading", Icon: Package },
	truck: { label: "Truck", Icon: Truck },
	bus: { label: "Bus", Icon: Bus },
};

type Status =
	| "idle"
	| "requested"
	| "awaiting pickup"
	| "started"
	| "completed"
	| "awaiting payment"
	| "confirmed"
	| "cancelled"
	| "rejected"
	| "expired";

const Page = () => {
	const router = useRouter();
	const params = useSearchParams();

	const pickUp = params.get("pickUp") || "";
	const drop = params.get("drop") || "";
	const vehicle = params.get("vehicle") || "";
	const name = params.get("name") || "";
	const mobile = Number(params.get("mobile"));
	const pickupLat = Number(params.get("pickupLat"));
	const pickupLon = Number(params.get("pickupLon"));
	const dropLat = Number(params.get("dropLat"));
	const dropLon = Number(params.get("dropLon"));
	const distance = Number(params.get("distance") || "0");
	const fare = Math.round(Number(params.get("fare")));
	const driverId = params.get("driver") || "";
	const vehicleId = params.get("vehicleId") || "";

	const { Icon, label } = VEHICE_META[vehicle];

	const [status, setStatus] = useState<Status>("idle");
	const [loading, setLoading] = useState(false);
	const [currBookingId, setCurrBookingId] = useState<string | null>(null);
	const [payMode, setPayMode] = useState<"cash" | "online">("cash");
	const { userData } = useSelector((state: RootState) => state.user);

	const handleBookRequest = async () => {
		try {
			setLoading(true);
			const res = await axios.post("/api/booking/create", {
				driverId,
				vehicleId,
				pickUpAddress: pickUp,
				dropAddress: drop,
				pickUpLocation: {
					type: "Point",
					coordinates: [pickupLon, pickupLat],
				},
				dropLocation: {
					type: "Point",
					coordinates: [dropLon, dropLat],
				},
				fare,
				customerName: name,
				customerMobile: mobile,
				distance,
			});

			if (res.status === 201) {
				setCurrBookingId(res.data._id.toString());
				setStatus("requested");
			}
		} catch (error: any) {
			console.log(error?.response.data.message);
		} finally {
			setLoading(false);
		}
	};

	const handleCancelRequest = async () => {
		try {
			setLoading(true);
			const res = await axios.post(
				`/api/booking/${currBookingId}/cancel-ride`,
			);

			if (res.status === 200) {
				setStatus("idle");
			}
		} catch (error: any) {
			console.log(error?.response.data.message);
		} finally {
			setLoading(false);
		}
	};

	const loadRazorPayScript = () => {
		return new Promise((resolve) => {
			if (typeof window === "undefined") {
				resolve(false);
			}

			if ((window as any).Razorpay) {
				resolve(true);
			}

			const script = document.createElement("script");
			script.src = "https://checkout.razorpay.com/v1/checkout.js";
			script.onload = () => resolve(true);
			script.onerror = () => resolve(false);
			document.body.appendChild(script);
		});
	};

	const handleCofirmPayment = async () => {
		if (!currBookingId || !payMode || payMode === "cash") return;

		try {
			if (payMode == "online") {
				const razorpayLoaded = await loadRazorPayScript();
				if (!razorpayLoaded) {
					alert("razorypay script load faild");
				}
			}

			const { data } = await axios.post("/api/payment/create", {
				bookingId: currBookingId,
				amount: fare,
			});

			if (!data.success || !data.orderId) {
				alert(
					"Failed to create payment order - " + (data.message || ""),
				);
				return;
			}
			console.log(data);

			const paymentObject = new (window as any).Razorpay({
				key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
				amount: data.amount,
				currency: data.currency,
				name: "Rydex - Smart Vehicle Booking Platform",
				description:
					"Making the payment means your ride has been successfully completed.",
				order_id: data.orderId,
				method: {
					upi: true,
					card: true,
					netbanking: true,
					wallet: true,
				},
				prefill: {
					name: userData?.name || "anonymous",
					email: userData?.email || "anonymous@anonymous.come",
					contact: userData?.mobile || "0000000000",
				},
				theme: { color: "#4F46E5" },

				handler: async function (response: any) {
					try {
						const {data} = await axios.post(
							"/api/payment/verify",
							{
								bookingId: currBookingId,
								razorpay_order_id: response.razorpay_order_id,
								razorpay_payment_id: response.razorpay_payment_id,
								razorpay_signature: response.razorpay_signature,
							},
						);

						if (data.success) {
							alert(
								`🎉 Payment Successful!\nThanks for choosing Rydex`,
							);
						} else {
							alert("Payment verification failed");
						}
					} catch (err) {
						console.error(err);
						alert("Payment verification failed");
					}
				},
			});
			paymentObject.open();
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		const activeBooking = async () => {
			try {
				const { data } = await axios.get("/api/booking/active-booking");
				setCurrBookingId(data[0]._id.toString());
				setStatus(data[0].bookingStatus);
			} catch (error: unknown) {
				console.log(error);
			}
		};

		activeBooking();
	}, []);

	useEffect(() => {
		if (status !== "awaiting pickup") return;
		const t = setTimeout(() => {
			setStatus("awaiting payment");
		}, 1200);
		return () => {
			clearTimeout(t);
		};
	}, [status]);

	return (
		<div className="min-h-screen bg-zinc-100 px-4 py-12">
			<div className="relative max-w-6xl mx-auto z-10">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
					className="mb-10 relative"
				>
					{/* Back Button */}
					<motion.button
						whileTap={{ scale: 0.88 }}
						onClick={() => router.back()}
						className="absolute right-0 top-5 w-11 h-11 rounded-full bg-white border border-zinc-200 shadow-md flex items-center justify-center hover:bg-zinc-50 transition-colors cursor-pointer"
					>
						<ArrowLeft />
					</motion.button>

					<div className="flex items-center gap-2 mb-2">
						<div className="h-px w-8 bg-zinc-900" />
						<span className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-400">
							Booking
						</span>
					</div>
					<h1 className="text-4xl font-black tracking-tight text-zinc-900">
						Checkout
					</h1>
					<p className="text-zinc-400 text-sm mt-1.5 font-medium">
						Review you ride and confirm
					</p>
				</motion.div>

				{/* Check out cards */}
				<div className="grid lg:grid-cols-2 gap-6">
					{/* Left side: Vehicle Details, Location(Drop, Pickup) and Pricing */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{
							delay: 0.08,
							duration: 0.5,
							ease: [0.22, 1, 0.36, 1],
						}}
						className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.07)]"
					>
						<div className="h-1 bg-zinc-900" />

						<div className="p-8 sm:p-10">
							{/* Selected Vehicle */}
							<div className="flex items-center justify-between mb-8">
								<div>
									<div className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 mb-1">
										Selected Vehicle
									</div>
									<div className="text-3xl font-black tracking-tight text-zinc-900 capitalize">
										{vehicle}
									</div>
								</div>
								<div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center shadow-lg">
									<Icon size={28} className="text-white" />
								</div>
							</div>

							{/* Pickup and Drop */}
							<div className="bg-zinc-50 border border-zinc-100 rounded-2xl overflow-hidden mb-8">
								{/* Pickup Location */}
								<div className="flex gap-4 px-5 py-4 border-b border-zinc-100 items-center">
									<div className="flex flex-col items-center shrink-0 pt-0.5">
										<div className="h-3 w-3 rounded-full bg-zinc-900 border-white ring-1 ring-zinc-300" />
										<div
											className="w-px flex-1 bg-zinc-300 my-1"
											style={{ minHeight: 12 }}
										/>
									</div>
									<div className="flex-1 min-w-0">
										<div className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-400 mb-0.5">
											Pickup
										</div>
										<div className="text-sm font-semibold text-zinc-900 leading-snug truncate">
											{pickUp}
										</div>
									</div>
									<MapPin
										size={16}
										className="text-zinc-400 shrink-0 mt-1"
									/>
								</div>
								{/* Drop Location */}
								<div className="flex gap-4 px-5 py-4 border-b border-zinc-100 items-center">
									<div className="flex flex-col items-center shrink-0 pt-0.5">
										<div className="h-3 w-3 bg-zinc-900 border-white ring-1 ring-zinc-300" />
									</div>
									<div className="flex-1 min-w-0">
										<div className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-400 mb-0.5">
											Drop
										</div>
										<div className="text-sm font-semibold text-zinc-900 leading-snug truncate">
											{drop}
										</div>
									</div>
									<RiSendPlaneFill
										size={16}
										className="text-zinc-400 shrink-0 mt-1"
									/>
								</div>
							</div>

							{/* Pricing */}
							<div className="flex items-end justify-between pt-6 border-t border-zinc-100">
								<div>
									<p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 mb-1">
										Total Fare
									</p>
									<p className="text-zinc-400 text-xs font-medium">
										Includes base fare + distance charges
									</p>
								</div>

								<motion.div
									initial={{ scale: 0.8, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									transition={{
										delay: 0.3,
										type: "spring",
										stiffness: 200,
									}}
									className="flex items-baseline gap-1"
								>
									<span className="text-zinc-400 text-lg font-black">
										<IndianRupee />
									</span>
									<span className="text-zinc-900 text-5xl font-black tracking-tight leading-none">
										{fare}
									</span>
								</motion.div>
							</div>
						</div>
					</motion.div>

					{/* Right side: Dynamic: change dynamically according to current status */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{
							delay: 0.08,
							duration: 0.5,
							ease: [0.22, 1, 0.36, 1],
						}}
						className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.07)] flex flex-col"
					>
						<div className="h-1 bg-zinc-900" />

						<div className="p-8 sm:p-10 flex flex-1 flex-col">
							<AnimatePresence mode="wait">
								{status === "idle" && (
									<motion.div
										key="idle"
										initial={{ opacity: 0, y: 12 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -12 }}
										transition={{ duration: 0.3 }}
										className="flex flex-col flex-1 justify-between"
									>
										<div>
											<p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 mb-1">
												Ready to Go!
											</p>
											<h3 className="text-2xl font-black text-zinc-900 mb-2">
												Comfirm Your Ride
											</h3>
											<div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-5 space-y-3">
												{[
													{
														icon: (
															<Clock4 size={14} />
														),
														text: "Driver will respond within 2 minutes",
													},
													{
														icon: (
															<ShieldCheck
																size={14}
															/>
														),
														text: "Verified and ensure drivers only",
													},
													{
														icon: (
															<CreditCard
																size={14}
															/>
														),
														text: "Pay after driver accepts",
													},
												].map((item, idx) => (
													<div
														key={idx}
														className="flex items-center gap-3"
													>
														<div className="w-7 h-7 rounded-xl bg-zinc-200 flex items-center justify-center text-zinc-600 shrink-0">
															{item.icon}
														</div>
														<p className="text-zinc-500 text-xs font-medium">
															{item.text}
														</p>
													</div>
												))}
											</div>
										</div>

										<motion.button
											onClick={handleBookRequest}
											whileTap={{ scale: 0.97 }}
											whileHover={{ scale: 1.02 }}
											className="w-full h-14 mt-8 bg-zinc-900 hover:bg-black disalbed-opacity-40 disabled:pointer-events-none text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2.5 transition-colors shadow-md cursor-pointer group overflow-x-hidden"
										>
											Request Ride{" "}
											<Icon className="group-hover:translate-x-2 group-focus:translate-x-96 transition-transform duration-700" />
										</motion.button>
									</motion.div>
								)}

								{status === "requested" && (
									<motion.div
										key="requested"
										initial={{ opacity: 0, scale: 0.96 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{
											opacity: 0,
											y: -4,
											scale: 0.96,
										}}
										transition={{ duration: 0.35 }}
										className="flex flex-col flex-1 items-center justify-center gap-6 text-center"
									>
										{/* Pulse Loading: Finding Driver */}
										<div className="relative">
											<motion.div
												animate={{
													scale: [1, 1.5, 1],
													opacity: [0.3, 0, 0.3],
												}}
												transition={{
													duration: 2,
													repeat: Infinity,
												}}
												className="absolute inset-0 rounded-full bg-zinc-900"
											/>
											<div className="relative w-20 h-20 rounded-full bg-zinc-100 border-2 border-zinc-200 flex items-center justify-center">
												<Loader2
													size={28}
													className="text-zinc-900 animate-spin"
												/>
											</div>
										</div>
										<div>
											<h3 className="text-xl font-black text-zinc-900 mb-1">
												Finding Your Driver
											</h3>
											<p className="text-zinc-400 text-sm font-medium">
												Waiting for driver to accept...
											</p>
										</div>

										<motion.button
											onClick={handleCancelRequest}
											whileTap={{ scale: 0.95 }}
											className="flex items-center gap-2 text-xs font-bold text-zinc-400  hover:text-zinc-900 transition-colors border border-zinc-200 hover:border-zinc-400 px-4 py-2.5 rounded-xl cursor-pointer"
										>
											<XCircle size={13} /> Cancel Request
										</motion.button>
									</motion.div>
								)}

								{status === "awaiting pickup" && (
									<motion.div
										key="awaiting pickup"
										initial={{ opacity: 0, scale: 0.94 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0 }}
										transition={{ duration: 0.35 }}
										className="flex flex-col flex-1 items-center justify-center gap-5 text-center"
									>
										<motion.div
											initial={{ scale: 0 }}
											animate={{ scale: 1 }}
											transition={{
												type: "spring",
												stiffness: 260,
												damping: 16,
											}}
											className="w-20 h-20 rounded-full bg-zinc-100 border-2 border-zinc-200 flex items-center justify-center"
										>
											<CheckCircle
												size={35}
												className="text-zinc-900"
											/>
										</motion.div>

										<div>
											<h3 className="text-xl font-black text-zinc-900 mb-1">
												Driver Accepted
											</h3>
											<p className="text-zinc-400 text-sm font-medium">
												Connecting & Redirecting to
												map...
											</p>
										</div>

										<div className="w-48 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
											<motion.div
												initial={{ width: 0 }}
												animate={{ width: "100%" }}
												transition={{ duration: 1 }}
												className="h-full bg-zinc-900 rounded-full"
											/>
										</div>
									</motion.div>
								)}

								{status === "awaiting payment" && (
									<motion.div
										key="awaiting payment"
										initial={{ opacity: 0, y: 12 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0 }}
										transition={{ duration: 0.3 }}
										className="flex flex-col flex-1 gap-6"
									>
										<div>
											<p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 mb-1">
												Almost There
											</p>
											<h3 className="text-2xl font-black text-zinc-900">
												Select Payment Method
											</h3>
										</div>

										<div className="flex flex-col space-y-3">
											{[
												{
													id: "cash",
													Icon: Banknote,
													title: "Cash",
													sub: "Pay driver in cash",
												},
												{
													id: "online",
													Icon: Wallet,
													title: "Online Payment",
													sub: "UPI · Card · Netbanking",
												},
											].map((p) => {
												const active = payMode === p.id;
												return (
													<motion.div
														key={p.id}
														whileTap={{
															scale: 0.97,
														}}
														onClick={() =>
															setPayMode(
																p.id as
																	| "cash"
																	| "online",
															)
														}
														className={` w-full flex cursor-pointer items-center gap-4 p-4 rounded-2xl border-2 text-left transtiion-all duration-200 ${active ? "bg-zinc-900 border-zinc-900" : "bg-zinc-50 border-zinc-200"} hover:border-zinc-400`}
													>
														<div
															className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${active ? "bg-white/10" : "bg-zinc-200"}`}
														>
															<p.Icon
																size={18}
																className={
																	active
																		? "text-white"
																		: "text-zinc-600"
																}
															/>
														</div>
														<div className="flex-1 min-w-0">
															<p
																className={`text-sm font-bold ${active ? "text-white" : "text-zinc-900"}`}
															>
																{p.title}
															</p>
															<p className="text-xs font-medium text-zinc-400">
																{p.sub}
															</p>
														</div>
														<AnimatePresence>
															{active && (
																<motion.div
																	initial={{
																		scale: 0,
																	}}
																	animate={{
																		scale: 1,
																	}}
																	exit={{
																		scale: 0,
																	}}
																>
																	<CheckCircle
																		size={
																			15
																		}
																		className="text-white shrink-0"
																	/>
																</motion.div>
															)}
														</AnimatePresence>
													</motion.div>
												);
											})}
										</div>

										<motion.button
											onClick={handleCofirmPayment}
											whileTap={{ scale: 0.97 }}
											whileHover={
												payMode ? { scale: 1.02 } : {}
											}
											disabled={!payMode}
											className="w-full h-14 bg-zinc-900 hover:bg-black disabled:opacity-30 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2.5 cursor-pointer transition-colors shadow-md mt-auto"
										>
											{payMode === "cash" ? (
												<Banknote size={16} />
											) : (
												<Wallet size={16} />
											)}
											Proceed to Payment{" "}
											<RiArrowRightSLine />
										</motion.button>
									</motion.div>
								)}
							</AnimatePresence>

							<div className="text-[9px] uppercase font-semibold tracking-[0.18em] text-zinc-400 gap-2 flex items-center justify-center mt-7 border-zinc-100">
								<ShieldCheck size={14} /> secure & verified
								booking
							</div>
						</div>
					</motion.div>
				</div>
			</div>
		</div>
	);
};

export default Page;
