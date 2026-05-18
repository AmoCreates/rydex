"use client";
import { setUserData } from "@/Toolkit/userSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

function Get(enabled: boolean) {
	const dispatch = useDispatch();
	useEffect(() => {
		if (!enabled) return;
		const getMe = async () => {
			try {
				const { data } = await axios.get("/api/user/me");
				console.log(data)
				dispatch(setUserData(data));
			} catch (error) {
				console.error("Error fetching user data:", error);
			}
		};
		getMe();
	}, [enabled, dispatch]);
}

export default Get;
