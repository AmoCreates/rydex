"use client";
import Hero from "./Hero";
import Slider from "./Slider";
import AuthModel from "./AuthModel";

type Props = {
	open: boolean;
	onClose: () => void;
};

const PublicHome = ({ open, onClose }: Props) => {
	
	return (
		<>
			<Hero/>
			<Slider />
			<AuthModel open={open} onClose={onClose} />
		</>
	);
};

export default PublicHome;
