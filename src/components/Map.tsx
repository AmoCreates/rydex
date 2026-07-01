"use client";
import React, { useEffect, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer } from "react-leaflet";
import axios from "axios";

type props = {
	pickUp: string;
	drop: string;
	setPickUpDrop: (p: string, d: string) => void;
	setDistance: (d: number) => void;
};

const Map = ({ pickUp, drop, setPickUpDrop, setDistance }: props) => {
	const [p1, setP1] = useState<[number, number]>();
	const [p2, setP2] = useState<[number, number]>();

	const geoCoding = async (q: string): Promise<[number, number] | null> => {
		try {
			const { data } = await axios.get(
				`photon.komoot.io/api/?q=${encodeURIComponent(q)}$limit=1`,
			);
			if (!data.features.length) return null;
			const [lon, lat] = data.features[0].geometry.coordinates;
			return [lon, lat];
		} catch (error) {
			console.log(error);
			return null;
		}
	};

	useEffect(() => {
		if (!pickUp || !drop) {
			return;
		}
		(async () => {
			const a = await geoCoding(pickUp);
			const b = await geoCoding(drop);
			if (!a || !b) {
				return;
			}
			setP1(a);
			setP2(b);
		})();
	}, [pickUp, drop]);

	return (
		<div className="relative h-full w-full bg-white bg-zinc-100">
			<MapContainer
				style={{ width: "100%", height: "100%" }}
				center={p1 ?? [0, 0]}
				zoom={13}
			>
				<TileLayer
					attribution='&copy; <a href="https://carto.com/">"CARTO"</a> contributors'
					url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
				/>
			</MapContainer>
		</div>
	);
};

export default Map;
