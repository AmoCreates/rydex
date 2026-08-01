"use client";
import React, { useEffect, useState } from "react";
import { MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";

let L: typeof import("leaflet");

type Props = {
	driverLocation: [number, number] | null;
	pickUpLocation: [number, number] | null;
	dropLocation: [number, number] | null;
	status: string | undefined;
};

// Map Recenter Helper Component
const MapRecenter = ({ center }: { center: [number, number] | null }) => {
	const map = useMap();
	useEffect(() => {
		if (center) {
			map.setView(center, map.getZoom(), { animate: true });
		}
	}, [center, map]);
	return null;
};

const LiveRideMap = ({
	driverLocation,
	pickUpLocation,
	dropLocation,
	status,
}: Props) => {
	const [leaflet, setLeaflet] = useState<typeof import("leaflet") | null>(null);
	
	// Separate states for dashed segment (Driver -> Pickup) and main route segment
	const [driverToPickupRoute, setDriverToPickupRoute] = useState<[number, number][]>([]);
	const [mainRoute, setMainRoute] = useState<[number, number][]>([]);

	// Dynamically import Leaflet on client side
	useEffect(() => {
		import("leaflet").then((leafletModule) => {
			L = leafletModule;
			setLeaflet(leafletModule);
		});
	}, []);

	const formattedStatus = status?.toLowerCase();
	const isCompleted = formattedStatus === "completed";

	const mapCenter: [number, number] | null = isCompleted
		? dropLocation ?? driverLocation ?? pickUpLocation
		: driverLocation ?? pickUpLocation ?? dropLocation;

	useEffect(() => {
		if (formattedStatus === "confirmed" || formattedStatus === "completed") {
			setDriverToPickupRoute([]);
			setMainRoute([]);
			return;
		}

		// Helper function to fetch OSRM route coordinates
		const fetchOSRMRoute = async (points: [number, number][]) => {
			if (points.length < 2) return [];
			const coordinatesString = points.map(([lat, lng]) => `${lng},${lat}`).join(";");
			try {
				const response = await fetch(
					`https://router.project-osrm.org/route/v1/driving/${coordinatesString}?overview=full&geometries=geojson`
				);
				const data = await response.json();
				if (data.routes && data.routes.length > 0) {
					return data.routes[0].geometry.coordinates.map(
						(coord: [number, number]) => [coord[1], coord[0]] as [number, number]
					);
				}
			} catch (error) {
				console.error("Error fetching road directions:", error);
			}
			return points;
		};

		const loadRoutes = async () => {
			if (formattedStatus === "awaiting pickup") {
				// 1. Dashed Route: Driver -> Pickup
				if (driverLocation && pickUpLocation) {
					const dashedCoords = await fetchOSRMRoute([driverLocation, pickUpLocation]);
					setDriverToPickupRoute(dashedCoords);
				} else {
					setDriverToPickupRoute([]);
				}

				// 2. Solid Route: Pickup -> Drop
				if (pickUpLocation && dropLocation) {
					const solidCoords = await fetchOSRMRoute([pickUpLocation, dropLocation]);
					setMainRoute(solidCoords);
				} else {
					setMainRoute([]);
				}
			} else if (formattedStatus === "started") {
				// Ride started: No dashed line; Solid Route from Driver (or Pickup) -> Drop
				setDriverToPickupRoute([]);
				const startPoint = driverLocation ?? pickUpLocation;
				if (startPoint && dropLocation) {
					const solidCoords = await fetchOSRMRoute([startPoint, dropLocation]);
					setMainRoute(solidCoords);
				} else {
					setMainRoute([]);
				}
			} else {
				setDriverToPickupRoute([]);
				const waypoints = [driverLocation, pickUpLocation, dropLocation].filter(
					(loc): loc is [number, number] => loc !== null
				);
				const coords = await fetchOSRMRoute(waypoints);
				setMainRoute(coords);
			}
		};

		loadRoutes();
	}, [driverLocation, pickUpLocation, dropLocation, status, formattedStatus]);

	if (!leaflet) {
		return (
			<div className="h-full w-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-medium text-sm">
				Loading Map...
			</div>
		);
	}

	const pickUpIcon = new leaflet.DivIcon({
		html: `
      <div style="display: flex; flex-direction: column; align-items: center; filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.25)); pointer-events: none;">
        <div style="background: #000000; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; white-space: nowrap;">PICKUP</div>
        <div style="width: 2px; height: 12px; background: #000000;"></div>
        <div style="width: 8px; height: 8px; background: #000000; border-radius: 50%;"></div>
      </div>
    `,
		className: "",
		iconSize: [80, 50],
		iconAnchor: [40, 50],
	});

	const dropIcon = new leaflet.DivIcon({
		html: `
      <div style="display: flex; flex-direction: column; align-items: center; filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15)); pointer-events: none;">
        <div style="background: #ffffff; color: #000000; border: 1.5px solid #000000; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; white-space: nowrap;">DROP</div>
        <div style="width: 2px; height: 12px; background: #000000;"></div>
        <div style="width: 8px; height: 8px; background: #ffffff; border: 2px solid #000000; border-radius: 50%;"></div>
      </div>
    `,
		className: "",
		iconSize: [80, 50],
		iconAnchor: [40, 50],
	});

	const driverIcon = new leaflet.DivIcon({
		html: `
      <div style="display: flex; align-items: center; justify-content: center; pointer-events: none;">
        <div style="width: 44px; height: 44px; background-color: #0d0d0d; color: #ffffff; border-radius: 50%; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(0, 0, 0, 1);">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
            <circle cx="7" cy="17" r="2"/>
            <path d="M9 17h6"/>
            <circle cx="17" cy="17" r="2"/>
          </svg>
        </div>
      </div>
    `,
		className: "",
		iconSize: [44, 44],
		iconAnchor: [22, 22],
	});

	const completedIcon = new leaflet.DivIcon({
		html: `
      <div style="display: flex; flex-direction: column; align-items: center; filter: drop-shadow(0 6px 18px rgba(0, 0, 0, 0.25)); pointer-events: none;">
        <div style="background: #000000; color: #ffffff; padding: 5px 14px; border-radius: 20px; font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; white-space: nowrap;">ARRIVED</div>
        <div style="width: 2px; height: 10px; background: #000000;"></div>
        <div style="width: 36px; height: 36px; background: #000000; color: #ffffff; border-radius: 50%; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.3);">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      </div>
    `,
		className: "",
		iconSize: [90, 60],
		iconAnchor: [45, 60],
	});

	return (
		<div className="relative h-full w-full bg-zinc-100">
			<MapContainer
				style={{ width: "100%", height: "100%" }}
				center={mapCenter ?? [0, 0]}
				zoom={14}
				zoomControl={false}
			>
				<TileLayer
					attribution='&copy; <a href="https://carto.com/">"CARTO"</a> contributors'
					url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
				/>

				<MapRecenter center={mapCenter} />

				{/* 1. Dashed Polyline (Driver -> Pickup) */}
				{driverToPickupRoute.length >= 2 && (
					<Polyline
						positions={driverToPickupRoute}
						pathOptions={{
							color: "#5c5d67",
							weight: 3.5,
							dashArray: "8, 8",
							lineCap: "round",
							lineJoin: "round",
						}}
					/>
				)}

				{/* 2. Solid Polyline (Main Route) */}
				{mainRoute.length >= 2 && (
					<Polyline
						positions={mainRoute}
						pathOptions={{
							color: "#0a0a0a",
							weight: 3.5,
							lineCap: "round",
							lineJoin: "round",
						}}
					/>
				)}

				{/* Markers */}
				{!isCompleted && driverLocation && (
					<Marker position={driverLocation} icon={driverIcon} />
				)}
				{!isCompleted && pickUpLocation && formattedStatus !== "started" && (
					<Marker position={pickUpLocation} icon={pickUpIcon} />
				)}
				{!isCompleted && dropLocation && (
					<Marker position={dropLocation} icon={dropIcon} />
				)}

				{isCompleted && dropLocation && (
					<Marker position={dropLocation} icon={completedIcon} />
				)}
			</MapContainer>
		</div>
	);
};

export default LiveRideMap;