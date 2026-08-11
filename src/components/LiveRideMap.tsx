"use client";
import React, { useEffect, useState } from "react";
import {
	MapContainer,
	Marker,
	Polyline,
	TileLayer,
	useMap,
} from "react-leaflet";

let L: typeof import("leaflet");

type Props = {
	driverLocation: [number, number] | null;
	pickUpLocation: [number, number] | null;
	dropLocation: [number, number] | null;
	status: string | undefined;
	onStats?: (data: {
		dstToPickUp: number;
		dstToDrop: number;
		estPickUpTime: number;
		estDropTime: number;
	}) => void;
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
	onStats,
}: Props) => {
	const [leaflet, setLeaflet] = useState<typeof import("leaflet") | null>(null);

	const [driverToPickupRoute, setDriverToPickupRoute] = useState<[number, number][]>([]);
	const [mainRoute, setMainRoute] = useState<[number, number][]>([]);

	useEffect(() => {
		import("leaflet").then((leafletModule) => {
			L = leafletModule;
			setLeaflet(leafletModule);
		});
	}, []);

	const formattedStatus = status?.toLowerCase();
	const isCompleted = formattedStatus === "completed";

	const mapCenter: [number, number] | null = isCompleted
		? (dropLocation ?? driverLocation ?? pickUpLocation)
		: (driverLocation ?? pickUpLocation ?? dropLocation);

	useEffect(() => {
		if (
			
			formattedStatus === "completed"
		) {
			Promise.resolve().then(() => {
				setDriverToPickupRoute([]);
				setMainRoute([]);
				onStats?.({
					dstToPickUp: 0,
					dstToDrop: 0,
					estPickUpTime: 0,
					estDropTime: 0,
				});
			});
			return;
		}

		// Helper function to fetch OSRM route, distance, and duration
		const fetchOSRMRoute = async (points: [number, number][]) => {
			if (points.length < 2) {
				return { coords: [], distance: 0, duration: 0 };
			}
			const coordinatesString = points
				.map(([lat, lng]) => `${lng},${lat}`)
				.join(";");
			try {
				const response = await fetch(
					`https://router.project-osrm.org/route/v1/driving/${coordinatesString}?overview=full&geometries=geojson`,
				);
				const data = await response.json();
				if (data.routes && data.routes.length > 0) {
					const route = data.routes[0];
					const coords = route.geometry.coordinates.map(
						(coord: [number, number]) =>
							[coord[1], coord[0]] as [number, number],
					);
					// distance is in meters, duration is in seconds
					return {
						coords,
						distance: route.distance, 
						duration: route.duration, 
					};
				}
			} catch (error) {
				console.error("Error fetching road directions:", error);
			}
			return { coords: points, distance: 0, duration: 0 };
		};

		const loadRoutes = async () => {
			let pickupData = { coords: [] as [number, number][], distance: 0, duration: 0 };
			let dropData = { coords: [] as [number, number][], distance: 0, duration: 0 };

			if (formattedStatus === "confirmed") {
				if (driverLocation && pickUpLocation) {
					pickupData = await fetchOSRMRoute([driverLocation, pickUpLocation]);
					setDriverToPickupRoute(pickupData.coords);
				} else {
					setDriverToPickupRoute([]);
				}

				if (pickUpLocation && dropLocation) {
					dropData = await fetchOSRMRoute([pickUpLocation, dropLocation]);
					setMainRoute(dropData.coords);
				} else {
					setMainRoute([]);
				}
			} else if (formattedStatus === "started") {
				setDriverToPickupRoute([]);
				const startPoint = driverLocation ?? pickUpLocation;
				if (startPoint && dropLocation) {
					dropData = await fetchOSRMRoute([startPoint, dropLocation]);
					setMainRoute(dropData.coords);
				} else {
					setMainRoute([]);
				}
			} else {
				setDriverToPickupRoute([]);
				const waypoints = [driverLocation, pickUpLocation, dropLocation].filter(
					(loc): loc is [number, number] => loc !== null,
				);
				dropData = await fetchOSRMRoute(waypoints);
				setMainRoute(dropData.coords);
			}

			// Send calculated stats back to parent
			if (onStats) {
				onStats({
					dstToPickUp: (pickupData.distance ?? 0)/1000, // in km
					dstToDrop: (dropData.distance ?? 0)/1000,     // in km
					estPickUpTime: (pickupData.duration ?? 0)/60, // in min
					estDropTime: (dropData.duration ?? 0)/60,   // in min
				});
			}
		};

		loadRoutes();
	}, [driverLocation, pickUpLocation, dropLocation, status, formattedStatus, onStats]);

	if (!leaflet) {
		return (
			<div className="h-full w-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-medium text-sm">
				Loading Map...
			</div>
		);
	}

	const pickUpIcon = new leaflet.DivIcon({
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

	const dropIcon = new leaflet.DivIcon({
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

				{!isCompleted && driverLocation && (
					<Marker position={driverLocation} icon={driverIcon} />
				)}
				{!isCompleted &&
					pickUpLocation &&
					formattedStatus !== "started" && (
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