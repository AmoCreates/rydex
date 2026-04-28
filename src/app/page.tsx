'use client'
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import PublicHome from "@/components/PublicHome";
import { useState } from "react";

export default function Home() {
  const [authOpen, setAuthOpen] = useState(false);
  return (
    <div className="w-full min-h-screen bg-white">
      <Nav onOpen={() =>setAuthOpen(true)} />
      <PublicHome open={authOpen} onClose={() => setAuthOpen(false)}/>
      <Footer/>
    </div>
  );
}
