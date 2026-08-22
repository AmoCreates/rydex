"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import Get from "./hooks/get";
import { getSocket } from "@/lib/socket";

const InitUser = () => {
	const { data: session, status } = useSession();

	// Keep your existing custom hook
	Get(status === "authenticated");

	useEffect(() => {
		if (status === "authenticated" && session?.user?.id) {
			const userId = session.user.id;

			// 1. Sync local storage so socket.ts auto-reconnect can find it
			localStorage.setItem("userId", userId);

			// 2. Emit identity event so socket server updates isOnline to true
			const socket = getSocket();
			if (socket) {
				if (socket.connected) {
					socket.emit("identity", userId);
				} else {
					socket.connect();
				}
			}
		}
	}, [status, session?.user?.id]);

	return null;
};

export default InitUser;