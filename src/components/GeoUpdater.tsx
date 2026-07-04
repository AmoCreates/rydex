import { getSocket } from "@/lib/socket";
import React, { useEffect, useRef } from "react";

const GeoUpdater = ({ userId }: { userId: string }) => {
	const socketRef = useRef<any>(null);

	useEffect(() => {
		if (!userId) {
			throw new Error("Bad request: no user found");
		}

		if (!navigator.geolocation) {
			console.log("Sorry can't find navigator");
			return;
		}

		socketRef.current = getSocket();
		socketRef.current.connect();
		socketRef.current.emit("identity", userId);

		const watcher = navigator.geolocation.watchPosition(
			({ coords }) => {
				socketRef.current.emit("update_coordinates", {
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

    return ()=>{navigator.geolocation.clearWatch(watcher)}
	}, [userId]);

	return null;
};

export default GeoUpdater;
