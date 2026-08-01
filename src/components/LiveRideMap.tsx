"use client";
import React, { useEffect, useState } from "react";
import { MapContainer, Marker, Polyline, TileLayer } from "react-leaflet";
import L from "leaflet";

type Props = {
	driverLocation: [number, number] | null;
	pickUpLocation: [number, number] | null;
	dropLocation: [number, number] | null;
};

// 1. PICKUP Marker
const pickUpIcon = new L.DivIcon({
	html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.25));
        pointer-events: none;
      ">
        <div style="
          background: #000000;
          color: #ffffff;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          white-space: nowrap;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">PICKUP</div>
        <div style="width: 2px; height: 12px; background: #000000;"></div>
        <div style="
          width: 8px;
          height: 8px;
          background: #000000;
          border-radius: 50%;
        "></div>
      </div>
    `,
	className: "",
	iconSize: [80, 50],
	iconAnchor: [40, 50],
});

// 2. DROP Marker
const dropIcon = new L.DivIcon({
	html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
        pointer-events: none;
      ">
        <div style="
          background: #ffffff;
          color: #000000;
          border: 1.5px solid #000000;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          white-space: nowrap;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">DROP</div>
        <div style="width: 2px; height: 12px; background: #000000;"></div>
        <div style="
          width: 8px;
          height: 8px;
          background: #ffffff;
          border: 2px solid #000000;
          border-radius: 50%;
        "></div>
      </div>
    `,
	className: "",
	iconSize: [80, 50],
	iconAnchor: [40, 50],
});

// 3. DRIVER Marker
const driverIcon = new L.DivIcon({
	html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
      ">
        <div style="
          width: 44px;
          height: 44px;
          background-color: #0d0d0d;
          color: #ffffff;
          border-radius: 50%;
          border: 2px solid #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
        ">
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

const LiveRideMap = ({
	driverLocation,
	pickUpLocation,
	dropLocation,
}: Props) => {
	const [route, setRoute] = useState<[number, number][]>([]);

	useEffect(() => {
		const loadroute = () => {
			// Ensure we have at least 2 locations to compute street directions
			const waypoints = [
				driverLocation,
				pickUpLocation,
				dropLocation,
			].filter((loc): loc is [number, number] => loc !== null);

			if (waypoints.length < 2) {
				setRoute([]);
				return;
			}

			// Convert coordinates to OSRM string format: "lng,lat;lng,lat;..."
			const coordinatesString = waypoints
				.map(([lat, lng]) => `${lng},${lat}`)
				.join(";");

			const fetchRoute = async () => {
				try {
					const response = await fetch(
						`https://router.project-osrm.org/route/v1/driving/${coordinatesString}?overview=full&geometries=geojson`,
					);
					const data = await response.json();

					if (data.routes && data.routes.length > 0) {
						// OSRM returns coordinates as [lng, lat], Leaflet requires [lat, lng]
						const routeCoords: [number, number][] =
							data.routes[0].geometry.coordinates.map(
								(coord: [number, number]) => [
									coord[1],
									coord[0],
								],
							);
						setRoute(routeCoords);
					}
				} catch (error) {
					console.error("Error fetching road directions:", error);
					// Fallback to straight lines if the routing request fails
					setRoute(waypoints);
				}
			};

			fetchRoute();
		};

    loadroute();
	}, [driverLocation, pickUpLocation, dropLocation]);

	return (
		<div className="relative h-full w-full bg-zinc-100">
			<MapContainer
				style={{ width: "100%", height: "100%" }}
				center={driverLocation ?? pickUpLocation ?? [0, 0]}
				zoom={13}
				zoomControl={false}
			>
				<TileLayer
					attribution='&copy; <a href="https://carto.com/">"CARTO"</a> contributors'
					url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
				/>

				{/* Road Network Polyline */}
				{route.length >= 2 && (
					<Polyline
						positions={route}
						pathOptions={{
							color: "#0a0a0a",
							weight: 3.5,
							lineCap: "round",
							lineJoin: "round",
						}}
					/>
				)}

				{driverLocation && (
					<Marker position={driverLocation} icon={driverIcon} />
				)}
				{pickUpLocation && (
					<Marker position={pickUpLocation} icon={pickUpIcon} />
				)}
				{dropLocation && (
					<Marker position={dropLocation} icon={dropIcon} />
				)}
			</MapContainer>
		</div>
	);
};

export default LiveRideMap;
