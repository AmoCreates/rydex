"use client";
import { useSession } from "next-auth/react";
import Get from "./hooks/get";

const InitUser = () => {
	const { status } = useSession();

	Get(status == "authenticated");
	return null;
};

export default InitUser;
