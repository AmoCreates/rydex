"use client";
import Hero from "./Hero";
import Slider from "./Slider";
import AuthModel from "./AuthModel";
import VideoGuidePopup from "./VideoGuidePopup";

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
			<VideoGuidePopup />
		</>
	);
};

export default PublicHome;
