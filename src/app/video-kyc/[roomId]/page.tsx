"use client";
import React, { useEffect, useRef, useState } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useSelector } from "react-redux";
import { RootState } from "@/Toolkit/store";
import Image from "next/image";
import {
	CheckCircle2,
	CheckCircle,
	Info,
	Mic,
	MicOff,
	PhoneOff,
	Video,
	VideoOff,
	XCircle,
	AlertTriangle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";

const Page = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const previewRef = useRef<HTMLVideoElement>(null);
	const { userData } = useSelector((state: RootState) => state.user);
	const [isCallStarted, setIsCallStarted] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [stream, setStream] = useState<MediaStream>();
	const [camera, setCamera] = useState(true);
	const [mic, setMic] = useState(true);
	const [adminCheck, setAdminCheck] = useState<boolean | null>(null);
	const [rejectionReason, setRejectionReason] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);
	const [errorMsg, setErrorMsg] = useState("");
	const [popup, setPopup] = useState(true);
	const router = useRouter();
	const { roomId } = useParams();

	useEffect(() => {
		if (isCallStarted) return;
		let localStream = new MediaStream();
		const init = async () => {
			try {
				localStream = await navigator.mediaDevices.getUserMedia({
					video: true,
					audio: true,
				});
				setStream(localStream);
				if (previewRef) {
					previewRef.current!.srcObject = localStream;
				}
			} catch (error) {
				console.log(error);
			}
		};

		init();
	}, [isCallStarted]);

	const toggleCamera = () => {
		if (!stream) return;
		const videoTrack = stream.getVideoTracks()[0];
		videoTrack.enabled = !videoTrack.enabled;
		setCamera(!camera);
	};

	const toggleMic = () => {
		if (!stream) return;
		const audioTrack = stream.getAudioTracks()[0];
		audioTrack.enabled = !audioTrack.enabled;
		setMic(!mic);
	};

	const handleDecision = async () => {
		setIsProcessing(true);
		setErrorMsg("");
		try {
			// Placeholder: Implement actual API logic here
			await axios.patch(
				`/api/admin/videoKyc/${roomId}/Kyc-approve-reject`,
				{
					roomId,
					action: adminCheck ? "approve" : "reject",
					reason: rejectionReason,
				},
			);

			setAdminCheck(null);
			setRejectionReason("");
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
			setErrorMsg(
				serverMessage ||
					"failed to cancel request, refresh the page and try again",
			);
		} finally {
			setIsProcessing(false);
			router.push("/");
		}
	};

	const startCall = async () => {
		const displayName =
			userData?.role == "admin"
				? "Admin"
				: `${userData?.name} (${userData?.email})`;
		try {
			setIsLoading(true);
			const appId = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID);
			const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET;
			const kit = ZegoUIKitPrebuilt.generateKitTokenForTest(
				appId,
				serverSecret!,
				roomId!.toString(),
				userData?._id?.toString() || `guest_${Date.now()}`,
				displayName || "Unknown User",
			);

			setIsCallStarted(true);
			setIsLoading(false);

			const zp = ZegoUIKitPrebuilt.create(kit);
			zp.joinRoom({
				container: containerRef.current,
				scenario: {
					mode: ZegoUIKitPrebuilt.OneONoneCall,
				},
				showMyCameraToggleButton: true,
				showMyMicrophoneToggleButton: true,
				turnOnCameraWhenJoining: camera,
				turnOnMicrophoneWhenJoining: mic,
				showPreJoinView: false,
			});
		} catch (error) {
			setIsLoading(false);
			console.log(error);
		}
	};

	useEffect(() => {
		const t = setTimeout(() => {
			setPopup(false);
		}, 5000);

		return () => {
			clearTimeout(t);
		};
	}, []);

	if (isLoading) {
		return (
			<div className="h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
				<div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
				<p className="text-zinc-400 animate-pulse">
					Setting up secure connection...
				</p>
			</div>
		);
	}
	return (
		<div className="relative h-screen bg-zinc-950 text-zinc-100 flex flex-col">
			{popup && (
				<div className=" absolute top-7 left-1/2 -translate-x-1/2 z-[9999]">
					<AnimatePresence>
						<motion.div
							initial={{ opacity: 0, y: -15 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -15 }}
							className="rounded-2xl border border-red-200 bg-red-50 p-3 sm:p-4 text-red-700 shadow-sm"
						>
							<div className="flex items-start gap-3">
								<div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-red-100 text-red-600">
									<AlertTriangle className="h-4 w-4" />
								</div>
								<div className="flex-1">
									<p className="text-sm font-semibold text-red-800">
										Something went wrong
									</p>
									<p className="mt-0.5 text-sm text-red-700">
										If you are automatically leaving the
										room, or facing other issues with the
										video call, it likely means that my
										FREE-API key has expired. No Money😅
									</p>
								</div>
							</div>
						</motion.div>
					</AnimatePresence>
				</div>
			)}
			<header className="px-6 py-4 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<Image
						src="/logo.png"
						width={44}
						height={44}
						alt="logo"
						priority
						className="w-auto h-auto"
					/>
					<p className="text-xs text-gray-400">
						{userData?.role == "admin"
							? "Admin Verification"
							: "Partner Video KYC"}
					</p>
				</div>

				{isCallStarted && (
					<div className="flex gap-3 flex-wrap">
						{userData?.role === "admin" && (
							<>
								<button
									onClick={() => setAdminCheck(true)}
									className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-full shadow-lg transition-all active:scale-95 cursor-pointer"
								>
									<CheckCircle size={16} />
									Approve KYC
								</button>
								<button
									onClick={() => setAdminCheck(false)}
									className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-full shadow-lg transition-all active:scale-95 cursor-pointer"
								>
									<XCircle />
									Reject KYC
								</button>
							</>
						)}
						<button
							onClick={() => {
								router.push("/");
							}}
							className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-full shadow-lg transition-all active:scale-95"
						>
							<PhoneOff size={16} />
							End Call
						</button>
					</div>
				)}
			</header>

			<main className="flex-1 relative">
				<div
					ref={containerRef}
					className={`absolute inset-0 w-full h-full ${!isCallStarted && "hidden"}`}
				/>
				{!isCallStarted && (
					<div className="h-full flex items-center justify-center px-4 py-10">
						<div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
							<div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5">
								<video
									ref={previewRef}
									className="w-full h-full"
									autoPlay
								/>
								{!camera && (
									<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
										<VideoOff
											size={40}
											className="text-white"
										/>
									</div>
								)}
							</div>

							<div className="space-y-8 text-center lg:text-left">
								<h1 className="text-3xl sm:text-4xl font-bold">
									Secure 1-on-1 Consultation
								</h1>

								<div className="flex justify-center lg:justify-start gap-6">
									<button
										className={`w-14 h-14 rounded-full flex items-center justify-center transition ${camera ? "bg-white text-black" : "bg-white/10 border border-white/20"} cursor-pointer`}
										onClick={toggleCamera}
									>
										{camera ? <Video /> : <VideoOff />}
									</button>
									<button
										className={`w-14 h-14 rounded-full flex items-center justify-center transition ${mic ? "bg-white text-black" : "bg-white/10 border border-white/20"} cursor-pointer`}
										onClick={toggleMic}
									>
										{mic ? <Mic /> : <MicOff />}
									</button>
								</div>

								<button
									className="w-full bg-white text-black py-4 font-semibold rounded-xl cursor-pointer active:scale-97"
									onClick={startCall}
								>
									Join Secure Call
								</button>
							</div>
						</div>
					</div>
				)}
			</main>

			{/*Admin Decision Confirmation Popup*/}
			<AnimatePresence>
				{adminCheck !== null && (
					<div className="fixed inset-0 z-100 flex items-center justify-center p-4">
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="absolute inset-0 bg-black/80 backdrop-blur-sm"
							onClick={() => setAdminCheck(null)}
						/>
						<motion.div
							initial={{ scale: 0.9, opacity: 0, y: 20 }}
							animate={{ scale: 1, opacity: 1, y: 0 }}
							exit={{ scale: 0.9, opacity: 0, y: 20 }}
							className="relative bg-zinc-900 border border-white/10 p-8 max-w-md w-full shadow-2xl space-y-6 rounded-3xl"
						>
							<div className="flex items-center gap-3">
								<div
									className={`p-3 rounded-2xl ${adminCheck ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}
								>
									{adminCheck ? (
										<CheckCircle2 size={24} />
									) : (
										<XCircle size={24} />
									)}
								</div>
								<div>
									<h3 className="text-xl font-bold text-zinc-100">
										{adminCheck
											? "Approve Video KYC"
											: "Reject Video KYC"}
									</h3>
									<p className="text-sm text-zinc-400">
										{adminCheck
											? "Confirm that you have successfully verified the partner identity and details via video call."
											: "Please provide a specific reason for rejecting this Video KYC session."}
									</p>
								</div>
							</div>

							{!adminCheck && (
								<div className="space-y-2">
									<label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
										<Info size={14} /> Rejection Reason
									</label>
									<textarea
										className="w-full bg-zinc-800 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:ring-2 ring-red-500/20 transition-all min-h-32 text-zinc-100 placeholder:text-zinc-600"
										placeholder="e.g. Identity documents not visible, Poor network, or Mismatched details..."
										value={rejectionReason}
										onChange={(e) =>
											setRejectionReason(e.target.value)
										}
									/>
								</div>
							)}

							{errorMsg && (
								<motion.p
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									className="text-xs text-red-500 font-medium bg-red-500/10 p-3 rounded-xl border border-red-500/20"
								>
									*{errorMsg}
								</motion.p>
							)}

							<div className="flex gap-3 pt-2">
								<button
									className="flex-1 py-3 rounded-xl font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
									onClick={() => setAdminCheck(null)}
								>
									Cancel
								</button>
								<button
									disabled={
										isProcessing ||
										(!adminCheck && !rejectionReason)
									}
									className={`flex-1 py-3 rounded-xl font-semibold text-white transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
										adminCheck
											? "bg-green-600"
											: "bg-red-600"
									}`}
									onClick={handleDecision}
								>
									{isProcessing
										? "Processing..."
										: adminCheck
											? "Confirm Approval"
											: "Confirm Rejection"}
								</button>
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default Page;
