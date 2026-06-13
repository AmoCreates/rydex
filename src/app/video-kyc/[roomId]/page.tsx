"use client";
import React, { useEffect, useRef, useState } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useSelector } from "react-redux";
import { RootState } from "@/Toolkit/store";
import Image from "next/image";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { useParams } from "next/navigation";

const Page = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const previewRef = useRef<HTMLVideoElement>(null);
	const { userData } = useSelector((state: RootState) => state.user);
	const [isCallStarted, setIsCallStarted] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [stream, setStream] = useState<MediaStream>();
	const [camera, setCamera] = useState(true);
	const [mic, setMic] = useState(true);
	const {roomId} = useParams();

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
	}, []);

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

	const startCall = async () => {
		const displayName = userData?.role == "admin" ? "Admin" : `${userData?.name} (${userData?.email})`;
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
				showPreJoinView: false,
			});
		} catch (error) {
			setIsLoading(false);
			console.log(error);
		}
	};

	return (
		<div className="h-screen bg-zinc-950 text-zinc-100 flex flex-col">
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
			</header>

			<main className="flex-1 relative">
				<div ref={containerRef} className={`absolute inset-0 w-full h-full ${!isCallStarted && 'hidden'}`}/>
				{!isCallStarted && (
					<div className="h-full flex items-center justify-center px-4 py-10">
						<div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
							<div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5">
								<video ref={previewRef} className="w-full h-full" autoPlay />
								{!camera && (
									<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
										<VideoOff size={40} className="text-white" />
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
								
								<button className="w-full bg-white text-black py-4 font-semibold rounded-xl cursor-pointer active:scale-97"
								onClick={startCall}>
									Join Secure Call
								</button>
							</div>

						</div>
					</div>
				)}
			</main>
		</div>
	);
};

export default Page;
