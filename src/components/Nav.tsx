"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/Toolkit/store";
import { signOut } from "next-auth/react";
import { RiHome9Fill, RiPhoneFill, RiTaxiFill } from "@remixicon/react";
import {
	BadgeInfo,
	Bike,
	Car,
	ChevronRight,
	LogOut,
	Menu,
	Truck,
	X,
} from "lucide-react";

const Nav_Items = ["Home", "Bookings", "About Us", "Contact Us"];

type Props = {
	onOpen: () => void;
};

const Nav = ({ onOpen }: Props) => {
	const pathName = usePathname();
	const dispatch = useDispatch<AppDispatch>();
	const [profileOpen, setProfileOpen] = useState(false);
	const [menuOpen, setMenuOpen] = useState(true);
	const { userData } = useSelector((state: RootState) => state.user);
	const router = useRouter();

	const handleSignOut = async () => {
		await signOut({ callbackUrl: "/", redirect: false });
		dispatch({ type: "user/setUserData", payload: null });
		setProfileOpen(false);
	};
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
							className="w-auto h-auto"
						/>
					</Link>
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
					<div className="md:hidden">
						<button
							className="px-4 py-1.5 rounded-full text-white text-sm cursor-pointer transition active:scale-95 font-semibold"
							onClick={() => {
								setMenuOpen(!menuOpen);
							}}
						>
							{menuOpen ? <X size={20} /> : <Menu size={20} />}
						</button>
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
												initial={{ opacity: 0, scale: 0.95 }}
												animate={{ opacity: 1, scale: 1 }}
												exit={{ opacity: 0, scale: 0.95 }}
												className="absolute hidden md:block right-0 top-14 w-75 bg-white text-black rounded-lg shadow-xl py-2 px-2 z-50 border border-gray-200"
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
																router.push('/partner/onboarding/vehicle')
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
															<ChevronRight size={16} className="ml-auto" />
														</div>
													)}
												</div>
												<Link
													href="/profile"
													className="block px-4 py-2 rounded-lg text-sm text-black hover:bg-gray-200"
												>
													Profile
												</Link>
												<Link
													href="/bookings"
													className="block px-4 py-2 rounded-lg text-sm text-black hover:bg-gray-200"
												>
													My Bookings
												</Link>

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

			<AnimatePresence>
				{menuOpen && (
					<motion.div
						initial={{ y: -30, opacity: 0, zIndex: 1 }}
						animate={{ y: 0, opacity: 1, zIndex: 50 }}
						exit={{ y: -60, opacity: 0, zIndex: 1 }}
						className="fixed md:hidden left-1/2 -translate-x-1/2 top-20 z-50 bg-transparent backdrop-blur-xl text-white rounded-lg shadow-xl w-87.5 py-2 px-2 border border-gray-200 flex"
					>
						{Nav_Items.map((item, index) => {
							const href = item !== "Home" ? `/${item.toLowerCase()}` : "/";
							const active = pathName === href;
							const icon =
								item === "Home" ? (
									<RiHome9Fill />
								) : item === "Bookings" ? (
									<RiTaxiFill />
								) : item === "About Us" ? (
									<BadgeInfo />
								) : item === "Contact Us" ? (
									<RiPhoneFill />
								) : null;
							return (
								<Link
									key={index}
									href={href}
									className={`px-4 py-2 rounded-lg  text-sm  cursor-pointer hover:bg-white/10 ${active ? "text-white bg-white/10" : "text-gray-400 hover:text-white"}`}
								>
									{icon && (
										<div className="flex flex-col items-center justify-center">
											{icon}
											<p className="text-xs mt-1">{item}</p>
										</div>
									)}
								</Link>
							);
						})}
					</motion.div>
				)}
			</AnimatePresence>

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
							<p className="text-lg font-semibold">{userData.name}</p>
							<p className="text-xs -mt-1 text-gray-500">{userData.role}</p>
							{userData.role !== "partner" && (
								<div
									onClick={() => {
										setProfileOpen(false);
									router.push('/partner/onboarding/vehicle')
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
									<ChevronRight size={16} className="ml-auto" />
								</div>
							)}
						</div>
						<Link
							href="/profile"
							className="block px-4 py-2 rounded-lg text-sm text-black hover:bg-gray-200"
						>
							Profile
						</Link>
						<Link
							href="/bookings"
							className="block px-4 py-2 rounded-lg text-sm text-black hover:bg-gray-200"
						>
							My Bookings
						</Link>

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
