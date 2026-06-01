import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";

const PUBLIC_ROUTES = ["/"];

function isPublicRoute(pathname: string) {
	return PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/auth");
}

export async function proxy(req: NextRequest) {
	const { pathname } = req.nextUrl;

	if (
		pathname.startsWith("/_next") ||
		pathname.startsWith("/favicon.ico") ||
		pathname.startsWith("/.") ||
		isPublicRoute(pathname)
	) {
		return NextResponse.next();
	}

	const session = await auth();
	if (!session) {
		return NextResponse.redirect(new URL("/", req.url));
	}

	const role = session.user.role;

	if (pathname.startsWith("/admin") && role !== "admin") {
		return NextResponse.redirect(new URL("/", req.url));
	}

	if (pathname.startsWith("/partner/onboarding") && role !== "customer") {
		return NextResponse.redirect(new URL("/partner", req.url));
	}

	if (
		pathname.startsWith("/partner") &&
		pathname.startsWith("/partner/onboarding") &&
		role === "partner"
	) {
		return NextResponse.redirect(new URL("/partner", req.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico|node_modules|heroImage.jpg|logo.png|google.png).*)",
	],
};
