"use client";
import { RootState } from "@/Toolkit/store";
import axios from "axios";
import { Bike, Bus, Car, Play, Truck } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

type Props = {
	onOpen: () => void;
};

const Hero = ({ onOpen }: Props) => {
	const { userData } = useSelector((state: RootState) => state.user);
	const router = useRouter();
	const [isActiveRide, setIsActiveRide] = useState(false);
	const [activeRideId, setActiveRideId] = useState("");

	useEffect(() => {
		const isActiveBooking = async () => {
			try {
				const res = await axios.get("api/bookings/active-ride");
				console.log(res);
				if (res.status === 200) {
					setIsActiveRide(true);
					setActiveRideId(res.data._id);
				}
			} catch (error: unknown) {
				if (axios.isAxiosError(error)) {
					console.log(error.response?.data?.message);
					return;
				}
				console.log(error);
			}
		};
		isActiveBooking();
	}, []);

	return (
		<div className="relative min-h-screen w-full overflow-hidden">
			<div
				className="absolute inset-0 bg-cover bg-center "
				style={{ backgroundImage: "url('/heroImage.jpg')" }}
			/>
			<div className="absolute inset-0 bg-black/80" />
			<div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 text-center">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-white font-extrabold text-4xl sm:text-5xl md:text-7xl"
				>
					Book Any Vehicle
				</motion.div>
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.6, duration: 0.5 }}
					className="mt-4 max-w-xl text-gray-300"
				>
					From daily rides to heavy transport - all in our platform.
				</motion.p>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5, duration: 0.5 }}
					className="mt-8 flex gap-8 text-gray-300"
				>
					<Bike size={30} />
					<Car size={30} />
					<Bus size={30} />
					<Truck size={30} />
				</motion.div>
				<div className="mt-12 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4">
					<motion.button
						className="cursor-pointer active:scale-95 px-10 py-4 bg-white text-black rounded-full font-semibold text-[18px] shadow-xl hover:scale-105 transition"
						onClick={() => {
							if (!userData) onOpen();
							else {
								if (isActiveRide)
									router.push(
										`/customer/active-ride/${activeRideId}`,
									);
								else router.push("/customer/book");
							}
						}}
					>
						{isActiveRide ? "Track My Ride" : "Book Now"}
					</motion.button>

					{/* Video Guide Buttons */}
					<motion.a
						href="https://lnkd.in/p/dFW4pVes"
						target="_blank"
						rel="noopener noreferrer"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.7, duration: 0.5 }}
						className="flex items-center gap-2 px-6 py-4 bg-black/50 hover:bg-black/80 text-white rounded-full font-medium text-base border border-white/25 backdrop-blur-md hover:scale-105 transition active:scale-95 shadow-lg"
					>
						<Play size={16} className="text-sky-400 fill-current" />
						Book Ride Guide ↗
					</motion.a>

					<motion.a
						href="https://lnkd.in/p/dddUSgHQ"
						target="_blank"
						rel="noopener noreferrer"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.8, duration: 0.5 }}
						className="flex items-center gap-2 px-6 py-4 bg-black/50 hover:bg-black/80 text-white rounded-full font-medium text-base border border-white/25 backdrop-blur-md hover:scale-105 transition active:scale-95 shadow-lg"
					>
						<Play size={16} className="text-emerald-400 fill-current" />
						Partner Guide ↗
					</motion.a>
				</div>
			</div>
		</div>
	);
};

export default Hero;
