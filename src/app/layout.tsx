import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Provider from "@/lib/Provider";
import ReduxProvider from "@/Toolkit/ReduxProvider";
import InitUser from "@/InitUser";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "RYDEX - Smart Vehicle Booking Platform",
	description:
		"RYDEX a modern multi-vendor vehicle booking platform where user can easily book cars, bikes, and commercial vehicles. RYDEX make mobility simple and reliable with its secure login, verified owners and transparent pricing",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col">
				<Provider>
					<ReduxProvider>
						{/* Initialize user session on app load */}
						<InitUser />
						{children}
					</ReduxProvider>
				</Provider>
			</body>
		</html>
	);
}
