'use client'
import React, { useState } from "react";
import Hero from "./Hero";
import Slider from "./Slider";
import AuthModel from "./AuthModel";


const PublicHome = () => {
  const [authOpen, setAuthOpen] = useState(false)
	return (
		<>
			<Hero />
      <Slider/>
      <AuthModel open={authOpen} onClose={() => setAuthOpen(false)}/>
		</>
	);
};

export default PublicHome;
