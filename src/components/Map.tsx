"use client";
import React, { useEffect, useState } from "react";
import L from "leaflet";
import {
	MapContainer,
	Marker,
	Polyline,
	TileLayer,
	useMap,
} from "react-leaflet";
import axios from "axios";
import { AnimatePresence, motion } from "motion/react";
import { MapPin } from "lucide-react";
import { RiSendPlaneFill, RiTimeFill } from "@remixicon/react";

type props = {
	pickUp: string;
	drop: string;
	setPickUpDrop: (p: string, d: string) => void;
	setDistance: (d: number) => void;
};

function FitBounds({ p1, p2 }: { p1: [number, number]; p2: [number, number] }) {
	const map = useMap();

	useEffect(() => {
		if (!p1 || !p2) return;

		const runFitBounds = () => {
			map.invalidateSize();
			map.fitBounds([p1, p2], {
				padding: [72, 72],
				maxZoom: 15,
				animate: true,
				duration: 1,
			});
		};

		const id = window.setTimeout(runFitBounds, 0);
		return () => window.clearTimeout(id);
	}, [p1, p2, map]);

	return null;
}

const pickUpIcon = new L.DivIcon({
	html: `
			<div style="
				display: flex;
				flex-direction: column;
				align-items: center;
				filter: drop-shadow(0 6px 18px rgba(0, 0, 0, 0.22));
				pointer-events: none;
			">
				<div style="
					background: #0a0a0a;
					color: #fff;
					padding: 5px 14px;
					border-radius: 100px;
					font-size: 10px;
					font-weight: 800;
					letter-spacing: 0.14em;
					text-transform: uppercase;
					white-space: nowrap;
					font-family: -apple-system, system-ui, sans-serif;
					box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
				">PICKUP</div>
				<div style="width: 2px; height: 10px; background: #0a0a0a; opacity: 0.4"></div>
				<div style="
					width: 13px;
					height: 13px;
					background: #0a0a0a;
					border-radius: 50%;
					border: 3px solid #fff;
					box-shadow: 0 0 2px rgba(0, 0, 0, 0.15), 0 3px 10px rgba(0, 0, 0, 0.3);
				"></div>
			</div>
		`,
	className: "",
	iconSize: [120, 60],
	iconAnchor: [60, 60],
});
const dropIcon = new L.DivIcon({
	html: `
			<div style="
				display: flex;
				flex-direction: column;
				align-items: center;
				filter: drop-shadow(0 6px 18px rgba(0, 0, 0, 0.22));
				pointer-events: none;
			">
				<div style="
					background: #0a0a0a;
					color: #fff;
					padding: 5px 14px;
					border-radius: 100px;
					font-size: 10px;
					font-weight: 800;
					letter-spacing: 0.14em;
					text-transform: uppercase;
					white-space: nowrap;
					font-family: -apple-system, system-ui, sans-serif;
					box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
				">DROP</div>
				<div style="width: 2px; height: 10px; background: #0a0a0a; opacity: 0.4"></div>
				<div style="
					width: 13px;
					height: 13px;
					background: #0a0a0a;
					border-radius: 50%;
					border: 3px solid #fff;
					box-shadow: 0 0 2px rgba(0, 0, 0, 0.15), 0 3px 10px rgba(0, 0, 0, 0.3);
				"></div>
			</div>
		`,
	className: "",
	iconSize: [120, 60],
	iconAnchor: [60, 60],
});

const Map = ({ pickUp, drop, setPickUpDrop, setDistance }: props) => {
	const [p1, setP1] = useState<[number, number] | null>(null);
	const [p2, setP2] = useState<[number, number] | null>(null);
	const [route, setRoute] = useState<[number, number][]>([]);
	const [km, setKm] = useState<number>(0);
	const [loading, setLoading] = useState(false);

	const geoCoding = async (q: string): Promise<[number, number] | null> => {
		try {
			const { data } = await axios.get(
				`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=1`,
			);
			const feature = data.features?.[0];
			if (!feature?.geometry?.coordinates) return null;

			const [lon, lat] = feature.geometry.coordinates as [number, number];
			return [lat, lon];
		} catch (error) {
			console.error(error);
			return null;
		}
	};

	async function loadRoute(
		start: [number, number] | null,
		end: [number, number] | null,
	) {
		// start and end should be "lon,lat" strings

		if (!start || !end) {
			console.error("error: Missing start or end coordinates");
			return;
		}

		try {
			const url = `http://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson&steps=true`;

			const { data } = await axios.get(url);

			if (!data.routes || data.routes.length === 0) {
				console.error({ error: "No route found" });
			}

			// routes will receives as longitude, latitude, make them save as lat, lon
			setRoute(
				data.routes[0].geometry.coordinates.map(
					([lon, lat]: number[]) => [lat, lon],
				),
			);
			// toFixed retuns the string '+' symbol convert it to number
			setKm(+(data.routes[0].distance / 1000).toFixed(2));
			setDistance(km);
		} catch (err) {
			console.error('error: "Failed to fetch route');
			console.error(err);
		}
	}

	const updateLocation = async (lat: number, lon: number) => {
		if (!lat || !lon) {
			console.log("cant find route");
			return;
		}

		setLoading(true);

		try {
			const { data } = await axios.get(
				`https://photon.komoot.io/reverse?lon=${lon}&lat=${lat}`,
			);
			if (data.features.length) {
				const p = data.features[0].properties;
				return [p.name, p.city, p.state, p.country]
					.filter(Boolean)
					.join(",");
			}
			return;
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	const dragPickUP = async (lat: number, lon: number) => {
		const p = await updateLocation(lat, lon);
		setP1([lat, lon]);
		loadRoute([lat, lon], p2);
		setPickUpDrop?.(p!, drop);
	};
	const dragDrop = async (lat: number, lon: number) => {
		const d = await updateLocation(lat, lon);
		setP2([lat, lon]);
		loadRoute(p1, [lat, lon]);
		setPickUpDrop?.(pickUp, d!);
	};

	useEffect(() => {
		if (!pickUp || !drop) {
			return;
		}
		(async () => {
			setLoading(true);
			const a = await geoCoding(pickUp);
			const b = await geoCoding(drop);
			if (!a || !b) {
				return;
			}
			await loadRoute(a, b);
			setP1(a);
			setP2(b);
			setLoading(false);
		})();
	}, [pickUp, drop]);

	return (
		<div className="relative h-full w-full bg-zinc-100">
			<MapContainer
				style={{ width: "100%", height: "100%" }}
				center={p1 ?? [0, 0]}
				zoom={13}
				zoomControl={false}
			>
				<TileLayer
					attribution='&copy; <a href="https://carto.com/">"CARTO"</a> contributors'
					url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
				/>
				{p1 && p2 && <FitBounds p1={p1} p2={p2} />}

				{p1 && (
					<Marker
						position={p1}
						icon={pickUpIcon}
						draggable
						eventHandlers={{
							dragend: (e) => {
								const m = e.target.getLatLng();
								dragPickUP(m.lat, m.lng);
							},
						}}
					/>
				)}
				{p2 && (
					<Marker
						position={p2}
						icon={dropIcon}
						draggable
						eventHandlers={{
							dragend: (e) => {
								const m = e.target.getLatLng();
								dragDrop(m.lat, m.lng);
							},
						}}
					/>
				)}

				{route.length !== 0 && (
					<>
						<Polyline
							positions={route}
							pathOptions={{
								color: "#0a0a0a",
								weight: 4,
								lineCap: "round",
								lineJoin: "round",
							}}
						/>
					</>
				)}
			</MapContainer>

			{/*Map Loading*/}
			<AnimatePresence>
				{loading && (
					<motion.div
						initial={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.45 }}
						className="absolute inset-0 z-999 bg-white/90 backdrop:blur-md flex flex-col items-center justify-center gap-4"
					>
						<div className="relative w-14 h-14 flex items-center justify-center">
							<motion.div
								animate={{ rotate: 360 }}
								transition={{
									duration: 1.1,
									repeat: Infinity,
									ease: "linear",
								}}
								className="absolute inset-0 rounded-full border-2 border-transparent border-t-zinc-900"
							/>
							<motion.div
								animate={{ rotate: -360 }}
								transition={{
									duration: 1.8,
									repeat: Infinity,
									ease: "linear",
								}}
								className="absolute inset-2 rounded-full border-2 border-transparent border-t-zinc-300"
							/>
							<MapPin size={15} className="text-zinc-800" />
						</div>

						<div className="text-center">
							<p className="text-zinc-900 text-xs font-black tracking-[0.22em] uppercase">
								Loading Map
							</p>
							<p className="text-zinc-400 text-[10px] font-medium tracking-wider mt-0.5">
								Plotting your route...
							</p>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Time & Distance */}
			<AnimatePresence>
				{!loading && km !== 0 && (
					<motion.div
						initial={{ opacity: 0, y: 8, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
						className="absolute bottom-18 left-4 z-500 flex items-center gap-2 bg-white border border-zinc-200 px-3.5 py-2 rounded-2xl shadow-lg"
					>
						{/* Distance */}
						<RiSendPlaneFill size={13} className="text-zinc-900" />
						<span className="text-zinc-900 text-xs font-bold">
							{km} km
						</span>

						<span className="w-px h-3 bg-zinc-300" />

						{/* Time */}
						<span className="text-zinc-900 text-xs font-bold flex items-center gap-2">
							<RiTimeFill size={13} /> ~{Math.round(km * 1.5)} min
						</span>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default Map;
