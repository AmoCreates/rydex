"use client";
import Hero from "./Hero";
import Slider from "./Slider";
import AuthModel from "./AuthModel";

type Props = {
	open: boolean;
	onClose: () => void;
	onOpen: () => void;
};

const PublicHome = ({ open, onOpen, onClose }: Props) => {
	return (
		<>
			<Hero onOpen={onOpen} />
			<Slider />
			<AuthModel open={open} onClose={onClose} />
		</>
	);
};

export default PublicHome;
