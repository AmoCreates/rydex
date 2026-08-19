import { TriangleAlert, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import { useState } from "react";

const RejectionCard = ({ rejectionMsg, step }: any) => {
	const router = useRouter();
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [isRequesting, setIsRequesting] = useState(false);
	const [requestError, setRequestError] = useState("");

	const handleRequest = async () => {
		setIsRequesting(true);
		setRequestError("");
		try {
			const res = await axios.patch("/api/partner/request-video-kyc");
			setShowConfirmation(false); // Close popup on success
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
			} finally {
			setIsRequesting(false);
			window.location.reload(); // Reload page regardless of success/failure to reflect potential status change or clear error
			alert("Video KYC Request Sent Successfully");
		}
	};
	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className="bg-red-50 border border-red-200 rounded-2xl md:rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.15)] p-5 sm:p-6 md:p-8 space-y-4 flex-col items-start gap-4"
		>
			<p className="flex gap-2 text-red-800 font-semibold items-center">
				{step === 3 ? (
					<>
						<TriangleAlert size={18} /> Details/documents/ rejected by Rydex
						team
					</>
				) : step === 4 ? (
					<>
						<TriangleAlert size={18} /> Video KYC rejected by Rydex team
					</>
				) : (
					<>
						<TriangleAlert size={18} /> Pricing & Vehicle rejected by Rydex team
					</>
				)}
			</p>

			<div className="bg-white p-3 w-full border border-gray-800 rounded-xl">
				{rejectionMsg}
			</div>

			<div className="flex flex-wrap gap-4 items-center">
				<button
					className="py-3 px-2 rounded-xl bg-black text-white font-semibold hover:opacity-80 transition-all cursor-pointer active:scale-97"
					onClick={() =>
						step == 6
							? router.push(`/partner/onboarding/pricing&vehicle`)
							: router.push(`/partner/onboarding/vehicle`)
					}
				>
					Update Documents/Details
				</button>
				{step === 4 && <p>OR</p>}
				{step === 4 && (
					<button
						className="py-3 px-2 rounded-xl bg-blue-500 text-white font-semibold hover:opacity-80 transition-all cursor-pointer active:scale-97" // Changed to open popup
						onClick={() => setShowConfirmation(true)}
					>
						Request Video KYC Again
					</button>
				)}
			</div>
			<p className="text-sm text-gray-500 -mt-3 ml-1">
				or you can click on the step to update specific field
			</p>

			{/* Confirmation Popup */}
			<AnimatePresence mode="wait">
				{showConfirmation && (
					<div className="fixed inset-0 z-100 flex items-center justify-center p-4">
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="absolute inset-0 bg-black/60 backdrop-blur-sm"
							onClick={() => setShowConfirmation(false)}
						/>
						<motion.div
							initial={{ scale: 0.9, opacity: 0, y: 20 }}
							animate={{ scale: 1, opacity: 1, y: 0 }}
							exit={{ scale: 0.9, opacity: 0, y: 20 }}
							className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6"
						>
							<div className="flex items-center gap-3">
								<div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
									<Video size={24} />
								</div>
								<div>
									<h3 className="text-xl font-bold">Request Video KYC Again</h3>
									<p className="text-sm text-gray-500">
										Are you sure you want to request a new Video KYC session?
										The admin will be notified to schedule a new call.
									</p>
								</div>
							</div>

							{requestError && (
								<motion.p
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									className="text-xs text-red-500 font-medium bg-red-500/10 p-3 rounded-xl border border-red-500/20"
								>
									*{requestError}
								</motion.p>
							)}

							<div className="flex gap-3 pt-2">
								<button
									className="flex-1 py-3 rounded-xl font-semibold text-black bg-gray-300 hover:bg-gray-100 transition-colors cursor-pointer"
									onClick={() => setShowConfirmation(false)}
								>
									Cancel
								</button>
								<button
									disabled={isRequesting}
									className={`flex-1 py-3 rounded-xl font-semibold text-white transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600`}
									onClick={handleRequest}
								>
									{isRequesting ? "Sending Request..." : "Confirm Request"}
								</button>
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</motion.div>
	);
};

export default RejectionCard;
