"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/Toolkit/store";
import { signOut, useSession } from "next-auth/react";
import { Bike, Car, ChevronRight, LogOut, Truck } from "lucide-react";
import { RiArrowRightSLine } from "@remixicon/react";
import axios from "axios";
import { getSocket } from "@/lib/socket";

const publicNav = [
	{ label: "Home", route: "/" },
	{ label: "Book", route: "/customer/book" },
	{ label: "About Us", route: "/about" },
	{ label: "Contact Us", route: "/contact" },
];

const partnerNav = [
	{ label: "Active Ride", route: "/partner/bookings/active-ride" },
	{ label: "Pending Request", route: "/partner/bookings/pending-requests" },
	{ label: "My Bookings", route: "/partner/bookings/mybookings" },
];

const partnerMenu = [
	{ label: "Profile", route: "/partner/profile" },
	{ label: "Active Ride", route: "/partner/bookings/active-ride" },
	{ label: "Pending Request", route: "/partner/bookings/pending-requests" },
	{ label: "My Bookings", route: "/partner/bookings/mybookings" },
];

type Props = {
	onOpen: () => void;
};

const Nav = ({ onOpen }: Props) => {
	const pathName = usePathname();
	const dispatch = useDispatch<AppDispatch>();
	const [profileOpen, setProfileOpen] = useState(false);
	const [pendingRequestCount, setPendingRequestCount] = useState(0);
	const [isActiveRide, setIsActiveRide] = useState(false);
	const [activeRideId, setActiveRideId] = useState<string | null>(null);
	const { data: session, status } = useSession();
	const userData = session?.user;
	const router = useRouter();
	const customerNav = [
		{ label: "Home", route: "/" },
		{
			label: isActiveRide ? "Track My Ride" : "Book Vehicle",
			route: activeRideId ? `/customer/active-ride/${activeRideId}` : "/customer/book",
		},
		{ label: "My Bookings", route: "/customer/bookings" },
	];
	const customerMenu = [
		{ label: "Profile", route: "/customer/profile" },
		{
			label: isActiveRide ? "Track My Ride" : "Book Vehicle",
			route: activeRideId ? `/customer/active-ride/${activeRideId}` : "/customer/book",
		},
		{ label: "My Bookings", route: "/customer/bookings" },
	];

	const handleSignOut = async () => {
		await signOut({ callbackUrl: "/", redirect: false });
		dispatch({ type: "user/setUserData", payload: null });
		setProfileOpen(false);

		if (typeof window !== "undefined") {
			window.localStorage.removeItem("userId");
		}

		const socket = getSocket();
		socket?.disconnect();
	};

	useEffect(() => {
		// persist user id and inform socket on login/change so reconnects re-auth
		if (userData?._id) {
			if (typeof window !== "undefined") {
				window.localStorage.setItem("userId", String(userData._id));
			}
			const socket = getSocket();
			socket?.connect();
			socket?.emit("identity", String(userData._id));
		}

		const fetchPendingCount = async () => {
			try {
				const { data } = await axios.get(
					"/api/partner/bookings/pending-requests",
				);
				setPendingRequestCount(data.length || 0);
			} catch (error: unknown) {
				const axiosError = error as {
					response?: {
						data?: {
							message?: string;
						};
					};
					message?: string;
				};
				const serverMessage = axiosError?.response?.data?.message;
				console.log(
					serverMessage ||
						axiosError?.response?.data ||
						axiosError?.message ||
						error,
				);
			}
		};

		const fetchActiveCount = async () => {
			try {
				const { data } = await axios.get(
					"/api/partner/bookings/active-ride",
				);
				setIsActiveRide(data.success);
			} catch (error: unknown) {
				const axiosError = error as {
					response?: {
						data?: {
							message?: string;
						};
					};
					message?: string;
				};
				const serverMessage = axiosError?.response?.data?.message;
				console.log(
					serverMessage ||
						axiosError?.response?.data ||
						axiosError?.message ||
						error,
				);
			}
		};

		const fetchCustomerActiveRide = async () => {
			try {
				const { data } = await axios.get("/api/bookings/active-ride");
				if (data && data._id) {
					setActiveRideId(data._id);
					setIsActiveRide(true);
					return;
				}
			} catch {
				console.log("no active ride found");
			}
			setActiveRideId(null);
			setIsActiveRide(false);
		};

		if (userData?.role === "partner") {
			fetchPendingCount();
			fetchActiveCount();
		}

		if (userData?.role === "customer") {
			fetchCustomerActiveRide();
		}
	}, [userData?._id, userData?.role]);

	useEffect(() => {
		const socket = getSocket();
		socket?.on("new-booking", (data) => {
			setPendingRequestCount((prev) => prev+1);
		});
		return () => {
			socket?.off("new-booking");
		};
	});

	return (
		<>
			<motion.div
				initial={{ y: -60, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				className={`fixed top-3 left-1/2 select-none -translate-x-1/2 w-[94%] md:w-[86%] z-50 rounded-full bg-[#0b0b0b] text-white shadow-[0_15px_50px_rgba(0,0,0,0.7)] py-3`}
			>
				<div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
					<Link
						href="/"
						className="flex items-center justify-center cursor-pointer"
					>
						<Image
							src="/logo.png"
							width={44}
							height={44}
							alt="logo"
							priority
							className="sm:w-auto h-auto"
						/>
					</Link>
					<div className="flex items-center gap-2 md:gap-4 lg:gap-10">
						{userData?.role === "customer" ? (
							<>
								{customerNav.map((item, index) => {
									const href = item.route;
									const active = pathName === href;
									return (
										<Link
											key={index}
											href={href}
											className={`text-[11px] sm:text-sm text-center font-medium transition pl-2 ${active ? "text-white" : "text-gray-400 hover:text-white"}`}
										>
											{item.label}
										</Link>
									);
								})}
							</>
						) : userData?.role === "partner" ? (
							<>
								{partnerNav.map((item, index) => {
									const href = item.route;
									const active = pathName === href;
									const isDisabledActiveRide =
										item.label === "Active Ride" && !isActiveRide;

									if (isDisabledActiveRide) {
										return (
											<span
												key={index}
												className="relative text-[12px] sm:text-sm text-center font-medium transition pl-2 text-gray-500 opacity-40 pointer-events-none select-none"
											>
												{item.label}
											</span>
										);
									}

									return (
										<Link
											key={index}
											href={href}
											className={`relative text-[12px] sm:text-sm text-center font-medium transition pl-2 ${active ? "text-white" : "text-gray-400 hover:text-white"}`}
										>
											{item.label}
											{item.label === "Pending Request" ? (
												<span
													className={`${item.label === "Pending Request" && (pendingRequestCount > 0 ? "absolute" : "hidden")} -top-1.5 -right-2 w-4 h-4 bg-white text-black text-[9px] rounded-full flex items-center justify-center font-bold`}
												>
													{item.label ===
														"Pending Request" &&
														pendingRequestCount}
												</span>
											) : (
												item.label === "Active Ride" &&
												<span
													className={`${isActiveRide ? "absolute" : "hidden"} -top-1.5 -right-2 w-4 h-4 bg-green-500 text-[9px] rounded-full flex items-center justify-center font-bold`}
												/>
											)}
										</Link>
									);
								})}
							</>
						) : (
							<>
								{publicNav.map((item, index) => {
									const href = item.route;
									const active = pathName === href;
									if (item.label === "Book") {
										if (status === "loading") {
											return (
												<button
													key={index}
													type="button"
													disabled
													className="text-[11px] sm:text-sm text-center font-medium transition pl-2 text-gray-500 cursor-not-allowed pointer-events-none opacity-60 flex items-center justify-center"
												>
													<span className="w-10 h-3.5 bg-zinc-700/80 rounded animate-pulse inline-block" />
												</button>
											);
										}
										if (!userData) {
											return (
												<button
													key={index}
													type="button"
													onClick={() => {
														if (typeof window !== "undefined") {
															window.localStorage.setItem("redirectAfterLogin", "/customer/book");
														}
														onOpen();
													}}
													className={`text-[11px] sm:text-sm text-center font-medium transition pl-2 cursor-pointer ${active ? "text-white" : "text-gray-400 hover:text-white"}`}
												>
													{item.label}
												</button>
											);
										}
									}
									return (
										<Link
											key={index}
											href={href}
											className={`text-[11px] sm:text-sm text-center font-medium transition pl-2 ${active ? "text-white" : "text-gray-400 hover:text-white"}`}
										>
											{item.label}
										</Link>
									);
								})}
							</>
						)}
					</div>

					<div className="flex items-center relative">
						<div className="md:block relative">
							{userData ? (
								<>
									<button
										className=" px-4 py-1.5 rounded-full bg-white text-black text-sm cursor-pointer transition active:scale-95 font-semibold"
										onClick={() => {
											setProfileOpen(!profileOpen);
										}}
									>
										{userData.name.split(" ")[0]}
									</button>
									<AnimatePresence>
										{profileOpen && (
											<motion.div
												initial={{
													opacity: 0,
													scale: 0.95,
												}}
												animate={{
													opacity: 1,
													scale: 1,
												}}
												exit={{
													opacity: 0,
													scale: 0.95,
												}}
												className="absolute hidden md:block right-0 top-14 w-75 bg-white text-black rounded-lg shadow-xl py-2 px-2 z-50 border border-gray-200"
											>
												<div className="py-2 text-center border-b border-gray-200 mb-1">
													<p className="text-lg font-semibold">
														{userData.name}
													</p>
													<p className="text-xs -mt-1 text-gray-500">
														{userData.role}
													</p>
													{userData.role ==
														"customer" && (
														<div
															onClick={() => {
																setProfileOpen(
																	false,
																);
																router.push(
																	"/partner/onboarding/vehicle",
																);
															}}
															className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-white text-black font-semibold cursor-pointer mt-2 gap-2 hover:bg-gray-200"
														>
															<div className="flex ">
																<Bike
																	size={14}
																	className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center"
																/>
																<Car
																	size={14}
																	className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center -ml-1"
																/>
																<Truck
																	size={14}
																	className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center -ml-1"
																/>
															</div>
															Become a Partner
															<ChevronRight
																size={16}
																className="ml-auto"
															/>
														</div>
													)}
												</div>

												{userData?.role ===
													"customer" &&
													customerMenu.map(
														(item, idx) => (
															<Link
																key={idx}
																href={
																	item.route
																}
																className="block px-4 py-2 rounded-lg text-sm text-black hover:bg-gray-200"
															>
																{item.label}
															</Link>
														),
													)}

												{userData?.role === "partner" &&
										partnerMenu.map((item, idx) => {
											if (item.label === "Active Ride" && !isActiveRide) {
												return (
													<button
														key={idx}
														type="button"
														className="w-full px-4 py-2 rounded-lg text-sm text-left text-gray-500 opacity-40 pointer-events-none select-none"
													>
														{item.label}
													</button>
												);
											}

											return (
												<Link
													key={idx}
													href={item.route}
													className="block px-4 py-2 rounded-lg text-sm text-black hover:bg-gray-200"
												>
													{item.label}
												</Link>
											);
										})}
												<button
													className="w-full  px-4 py-2 rounded-lg text-sm text-black cursor-pointer hover:bg-gray-400 flex gap-1 items-center"
													onClick={handleSignOut}
												>
													<LogOut
														size={16}
														className="text-black"
													/>
													Logout
												</button>
											</motion.div>
										)}
									</AnimatePresence>
								</>
							) : status === "loading" ? (
								<button
									disabled
									className="px-4 py-1.5 rounded-full bg-zinc-800 text-zinc-400 text-sm cursor-not-allowed pointer-events-none flex items-center justify-center opacity-80"
								>
									<span className="w-10 h-4 bg-zinc-700 rounded animate-pulse inline-block" />
								</button>
							) : (
								<button
									className=" px-4 py-1.5 rounded-full bg-white text-black text-sm cursor-pointer transition active:scale-95"
									onClick={onOpen}
								>
									Login
								</button>
							)}
						</div>
					</div>
				</div>
			</motion.div>

			{/* Menu for small devices */}
			<AnimatePresence>
				{profileOpen && userData && (
					<motion.div
						initial={{ y: 400 }}
						animate={{ y: 0 }}
						exit={{ y: 400 }}
						transition={{ type: "spring", damping: 25 }}
						className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl z-50 md:hidden"
					>
						<div className="py-2 text-center border-b border-gray-200 mb-1">
							<p className="text-lg font-semibold">
								{userData.name}
							</p>
							<p className="text-xs -mt-1 text-gray-500">
								{userData.role}
							</p>
							{userData.role !== "partner" && (
								<div
									onClick={() => {
										setProfileOpen(false);
										router.push(
											"/partner/onboarding/vehicle",
										);
									}}
									className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-white text-black font-semibold cursor-pointer mt-2 gap-2 hover:bg-gray-200"
								>
									<div className="flex ">
										<Bike
											size={14}
											className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center"
										/>
										<Car
											size={14}
											className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center -ml-1"
										/>
										<Truck
											size={14}
											className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center -ml-1"
										/>
									</div>
									Become a Partner
									<ChevronRight
										size={16}
										className="ml-auto"
									/>
								</div>
							)}
						</div>

						{userData?.role === "customer" &&
							customerMenu.map((item, idx) => (
								<Link
									key={idx}
									href={item.route}
									className="block px-4 py-2 rounded-lg text-sm text-black hover:bg-gray-200"
								>
									{item.label}
								</Link>
							))}

						{userData?.role === "partner" &&
							partnerMenu.map((item, idx) => {
								if (item.label === "Active Ride" && !isActiveRide) {
									return (
										<button
											key={idx}
											type="button"
											className="w-full px-4 py-2 rounded-lg text-sm text-left text-gray-500 opacity-40 pointer-events-none select-none"
										>
											<div className="flex items-center justify-between">
												{item.label} <RiArrowRightSLine />
											</div>
										</button>
									);
								}

								return (
									<Link
										key={idx}
										href={item.route}
										className="block px-4 py-2 rounded-lg text-sm text-black hover:bg-gray-200"
									>
										<div className="flex items-center justify-between">
											{item.label} <RiArrowRightSLine />
										</div>
									</Link>
								);
							})}

						<button
							className="w-full  px-4 py-2 rounded-lg text-sm text-black cursor-pointer hover:bg-gray-400 flex gap-1 items-center"
							onClick={handleSignOut}
						>
							<LogOut size={16} className="text-black" />
							Logout
						</button>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
};

export default Nav;
