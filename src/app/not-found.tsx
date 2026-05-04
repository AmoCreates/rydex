'use client'
import Nav from "@/components/Nav";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="w-full min-h-screen bg-white">
      <Nav onOpen={() => {}} />
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <Link
          href="/"
          className="px-6 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}