"use client";
import { getSocket } from "@/lib/socket";
import { useEffect, useRef } from "react";

const GeoUpdater = ({ userId }: { userId: string }) => {
	const socketRef = useRef<any>(null);

	useEffect(() => {
		// Return early if session is still loading instead of throwing an error
		if (!userId) return;

		if (!navigator.geolocation) {
			console.log("Sorry can't find navigator");
			return;
		}

		socketRef.current = getSocket();
		if (socketRef.current && !socketRef.current.connected) {
			socketRef.current.connect();
		}
		
		socketRef.current?.emit("identity", userId);

		const watcher = navigator.geolocation.watchPosition(
			({ coords }) => {
				socketRef.current?.emit("update_coordinates", {
					userId,
					lon: coords.longitude,
					lat: coords.latitude,
				});
			},
			(err) => {
				console.log(err);
			},
			{
				enableHighAccuracy: true,
				maximumAge: 5000,
			},
		);

		return () => {
			navigator.geolocation.clearWatch(watcher);
		};
	}, [userId]);

	return null;
};

export default GeoUpdater;