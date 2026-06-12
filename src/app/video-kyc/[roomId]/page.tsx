"use client";
import React, { useEffect, useRef, useState } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useSelector } from "react-redux";
import { RootState } from "@/Toolkit/store";
import Image from "next/image";

const Page = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const previewRef = useRef<HTMLVideoElement>(null);
	const { userData } = useSelector((state: RootState) => state.user);
	const [isCallStarted, setIsCallStarted] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
	const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
	const [selectedCameraId, setSelectedCameraId] = useState("");
	const [selectedMicId, setSelectedMicId] = useState("");
	const [cameraEnabled, setCameraEnabled] = useState(true);
	const [micEnabled, setMicEnabled] = useState(true);
	const [deviceError, setDeviceError] = useState<string | null>(null);
	const [previewActive, setPreviewActive] = useState(false);
	const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
	const previewStreamRef = useRef<MediaStream | null>(null);

	useEffect(() => {
		const cleanUpPreview = () => {
			if (previewStreamRef.current) {
				previewStreamRef.current.getTracks().forEach((track) => track.stop());
				previewStreamRef.current = null;
				setPreviewStream(null);
			}
		};

		const loadDevices = async () => {
			if (!navigator?.mediaDevices?.enumerateDevices) {
				setDeviceError("Your browser does not support device selection.");
				return;
			}

			try {
				await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
				const devices = await navigator.mediaDevices.enumerateDevices();
				const availableCameras = devices.filter((device) => device.kind === "videoinput");
				const availableMics = devices.filter((device) => device.kind === "audioinput");

				setCameras(availableCameras);
				setMicrophones(availableMics);
				setSelectedCameraId((prev) => prev || availableCameras[0]?.deviceId || "");
				setSelectedMicId((prev) => prev || availableMics[0]?.deviceId || "");
				setDeviceError(null);
			} catch {
				setDeviceError("Unable to access camera or microphone. Please allow permissions and refresh.");
			}
		};

		loadDevices();
		return cleanUpPreview;
	}, []);

	useEffect(() => {
		const updatePreview = async () => {
			if (!previewActive || !navigator?.mediaDevices?.getUserMedia) {
				if (previewStreamRef.current) {
					previewStreamRef.current.getTracks().forEach((track) => track.stop());
					previewStreamRef.current = null;
					setPreviewStream(null);
				}
				return;
			}

			const constraints: MediaStreamConstraints = {
				audio: micEnabled
					? selectedMicId
						? { deviceId: { exact: selectedMicId } }
						: true
					: false,
				video: cameraEnabled
					? selectedCameraId
						? { deviceId: { exact: selectedCameraId }, width: 1280, height: 720 }
						: true
					: false,
			};

			try {
				if (previewStreamRef.current) {
					previewStreamRef.current.getTracks().forEach((track) => track.stop());
				}
				const stream = await navigator.mediaDevices.getUserMedia(constraints);
				previewStreamRef.current = stream;
				setPreviewStream(stream);
				setDeviceError(null);
			} catch {
				setDeviceError("Unable to create preview from selected devices.");
			}
		};

		updatePreview();
		return () => {
			if (previewStreamRef.current) {
				previewStreamRef.current.getTracks().forEach((track) => track.stop());
				previewStreamRef.current = null;
			}
		};
	}, [selectedCameraId, selectedMicId, cameraEnabled, micEnabled, previewActive]);

	useEffect(() => {
		if (previewRef.current) {
			previewRef.current.srcObject = previewStream;
		}
	}, [previewStream]);

	const startCall = async () => {
		try {
			setIsLoading(true);
			const appId = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID);
			const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET;
			const roomId = "aLD6pSC7ujlz8YurpTOHOz2t";
			const userName = userData?.name;
			const kit = ZegoUIKitPrebuilt.generateKitTokenForTest(
				appId,
				serverSecret!,
				roomId,
				userData?._id?.toString() || `guest_${Date.now()}`,
				userName || "Guest User",
			);

			setIsCallStarted(true);
			setIsLoading(false);

			const zp = ZegoUIKitPrebuilt.create(kit);
			const joinOptions = {
				container: containerRef.current,
				scenario: {
					mode: ZegoUIKitPrebuilt.OneONoneCall,
				},
				showPreJoinView: false,
				turnOnCameraWhenJoining: cameraEnabled,
				turnOnMicrophoneWhenJoining: micEnabled,
				...(selectedCameraId ? { videoInput: selectedCameraId } : {}),
				...(selectedMicId ? { audioInput: selectedMicId } : {}),
			};

			zp.joinRoom(joinOptions as unknown as Parameters<typeof zp.joinRoom>[0]);
		} catch (error) {
			setIsLoading(false);
			console.error(error);
		}
	};

	return (
		<div className="min-h-screen bg-[#05070f] text-zinc-100 relative overflow-hidden pb-8">
			<div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-linear-to-b from-sky-500/20 via-transparent to-transparent blur-3xl" />
			<div className="pointer-events-none absolute -right-25 top-24 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
			<div className="pointer-events-none absolute -left-25 bottom-20 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

			<header className="relative z-10 mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3">
					<Image src="/logo.png" width={48} height={48} alt="logo" priority className="rounded-2xl bg-white/5 p-2" />
					<div>
						<p className="text-sm uppercase tracking-[0.3em] text-sky-300/70">
							Rydex KYC Suite
						</p>
						<h1 className="text-xl font-semibold text-white">
							{userData?.role === "admin" ? "Admin Verification" : "Partner Video KYC"}
						</h1>
					</div>
				</div>
				<div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300 shadow-lg shadow-black/20">
					Secure session • Camera & mic preview
				</div>
			</header>

			<div className="relative z-10 mx-auto grid max-w-7xl gap-6 px-6 pt-4 lg:grid-cols-[1.6fr_1fr]">
				<div className="rounded-4xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						<div>
							<p className="text-sm uppercase tracking-[0.3em] text-sky-300/80">Pre-call setup</p>
							<h2 className="mt-2 text-3xl font-semibold text-white">Check your devices before joining</h2>
							<p className="mt-2 max-w-2xl text-sm text-zinc-400">
								Select your preferred camera and microphone, then verify your preview and readiness for the secure video KYC session.
							</p>
						</div>
						<div className="rounded-3xl bg-slate-950/90 px-5 py-4 text-sm text-zinc-300 ring-1 ring-white/10 shadow-inner">
							<div className="font-medium text-white">Room ID</div>
							<div className="mt-1 text-sky-300">aLD6pSC7ujlz8YurpTOHOz2t</div>
						</div>
					</div>

					<div className="mt-6 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
						<div className="rounded-3xl border border-white/10 bg-slate-950/90 p-4 shadow-lg shadow-black/20">
							<div className="overflow-hidden rounded-3xl border border-white/10 bg-black/70">
								<video
									autoPlay
									muted
									playsInline
									ref={previewRef}
									className="h-80 w-full object-cover bg-zinc-950"
								/>
							</div>
							<div className="mt-4 flex items-center justify-between gap-3">
								<div>
									<p className="text-sm font-medium text-white">Camera preview</p>
									<p className="text-xs text-zinc-500">Live view from your selected device</p>
								</div>
								<button
									onClick={() => setPreviewActive((open) => !open)}
									type="button"
									className="rounded-2xl bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-300 transition hover:bg-sky-500/20"
								>
									{previewActive ? "Stop preview" : "Start preview"}
								</button>
							</div>
							<div className="mt-4 rounded-3xl border border-white/10 bg-zinc-950/90 p-4 text-sm text-zinc-300">
								<p className="font-medium text-white">Status</p>
								<p className="mt-2">{cameraEnabled ? "Camera ready" : "Camera off"}</p>
								<p className="mt-1">{micEnabled ? "Microphone ready" : "Microphone muted"}</p>
								{deviceError && <p className="mt-2 text-sm text-rose-400">{deviceError}</p>}
							</div>
						</div>
						<div className="space-y-5 rounded-3xl border border-white/10 bg-slate-950/90 p-5 shadow-lg shadow-black/20">
							<div className="space-y-3">
								<div className="flex items-center justify-between gap-2 rounded-3xl bg-white/5 px-4 py-3">
									<div>
										<p className="text-sm font-medium text-white">Camera</p>
										<p className="text-xs text-zinc-400">Choose your video source</p>
									</div>
									<label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 transition hover:border-sky-300/40">
										<input
											checked={cameraEnabled}
											onChange={() => setCameraEnabled((state) => !state)}
											type="checkbox"
											className="h-4 w-4 rounded border-slate-500 bg-slate-800 text-sky-400 focus:ring-sky-300"
										/>
										<span>{cameraEnabled ? "Enabled" : "Disabled"}</span>
									</label>
								</div>
								<select
									value={selectedCameraId}
									onChange={(event) => setSelectedCameraId(event.target.value)}
									className="w-full rounded-3xl border border-white/10 bg-black/80 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/70 focus:ring-1 focus:ring-sky-400/20"
								>
									{cameras.length === 0 ? (
										<option value="">No camera detected</option>
									) : (
										cameras.map((camera) => (
											<option key={camera.deviceId} value={camera.deviceId}>
												{camera.label || "Camera"}
											</option>
										))
									)}
								</select>
							</div>

							<div className="space-y-5">
								<div className="flex items-center justify-between gap-2 rounded-3xl bg-white/5 px-4 py-3">
									<div>
										<p className="text-sm font-medium text-white">Microphone</p>
										<p className="text-xs text-zinc-400">Choose your audio source</p>
									</div>
									<label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 transition hover:border-sky-300/40">
										<input
											checked={micEnabled}
											onChange={() => setMicEnabled((state) => !state)}
											type="checkbox"
											className="h-4 w-4 rounded border-slate-500 bg-slate-800 text-sky-400 focus:ring-sky-300"
										/>
										<span>{micEnabled ? "Enabled" : "Muted"}</span>
									</label>
								</div>
								<select
									value={selectedMicId}
									onChange={(event) => setSelectedMicId(event.target.value)}
									className="w-full rounded-3xl border border-white/10 bg-black/80 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/70 focus:ring-1 focus:ring-sky-400/20"
								>
									{microphones.length === 0 ? (
										<option value="">No microphone detected</option>
									) : (
										microphones.map((mic) => (
											<option key={mic.deviceId} value={mic.deviceId}>
												{mic.label || "Microphone"}
											</option>
										))
									)}
								</select>
							</div>

							<div className="space-y-3 rounded-3xl border border-white/10 bg-slate-900/90 p-5 text-sm text-zinc-300">
								<p className="text-sm font-semibold text-white">Ready to start</p>
								<p>Verify that your camera and microphone are working before joining the call.</p>
								<button
									onClick={startCall}
									type="button"
									disabled={isLoading}
									className={`w-full rounded-3xl py-4 text-sm font-semibold transition ${
										isLoading
											? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
											: "bg-sky-500 text-white hover:bg-sky-400 shadow-lg shadow-sky-500/20"
									}`}>
									{isLoading ? "Starting secure session…" : "Join Video KYC"}
								</button>
								<p className="text-xs text-zinc-500">Secure, encrypted session managed by Zego.</p>
							</div>
						</div>
					</div>
				</div>

				<div className="rounded-4xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
					<div className="flex flex-col gap-4">
						<div className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-900/80 p-4">
							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300/80">Why this step matters</p>
								<h3 className="mt-2 text-xl font-semibold text-white">Professional KYC readiness</h3>
							</div>
							<span className="rounded-3xl bg-sky-500/10 px-4 py-2 text-xs font-semibold text-sky-200">Fast setup</span>
						</div>

						<div className="grid gap-4 text-sm text-zinc-300">
							<div className="rounded-3xl border border-white/10 bg-white/5 p-4">
								<p className="font-semibold text-white">Clean verification flow</p>
								<p className="mt-2 leading-6">Your camera preview ensures the agent sees your profile clearly and your selected mic captures crisp audio.</p>
							</div>
							<div className="rounded-3xl border border-white/10 bg-white/5 p-4">
								<p className="font-semibold text-white">Privacy-first controls</p>
								<p className="mt-2 leading-6">Toggle devices on or off before joining so you only share what you want during the session.</p>
							</div>
							<div className="rounded-3xl border border-white/10 bg-white/5 p-4">
								<p className="font-semibold text-white">Session integrity</p>
								<p className="mt-2 leading-6">This page confirms device readiness and reduces interruptions during your secure KYC call.</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{isCallStarted && (
				<div ref={containerRef} className="fixed inset-0 z-20 bg-black/95" />
			)}
		</div>
	);
};

export default Page;
