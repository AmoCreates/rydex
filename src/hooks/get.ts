"use client";
import axios from "axios";
import { useEffect } from "react";

function Get(enabled:boolean) {
	useEffect(() => {
		if (!enabled) return;
		const getMe = async () => {
			const { data } = await axios.get("/api/user/me");
			console.log(data);
		};
		getMe();
	}, [enabled]);
}

export default Get;
