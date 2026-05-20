import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";
import path from "path";

const PUBLIC_ROUTES = ["/"];
export async function proxy(req: NextRequest) {
	const { pathname } = req.nextUrl;
	console.log(pathname);

	if (
		pathname.startsWith("/_next") ||
		pathname.startsWith("/favicon.ico") ||
		pathname.startsWith(".") ||
		PUBLIC_ROUTES.includes(pathname)
	)
		return NextResponse.next();

	const session = await auth();
	if (!session) {
		return NextResponse.redirect(new URL("/auth/signin", req.url)); // new URL to add after the main url, mainURL
	}

	const role = session.user.role;

	if (pathname.startsWith("/admin")) {
		if (role !== "admin") return NextResponse.redirect(new URL("/", req.url));
	}

	if (pathname.startsWith("/partner")) {
		if (pathname.startsWith("/partner/onboarding")) {
			return NextResponse.next();
		}
		if (role !== "partner") return NextResponse.redirect(new URL("/", req.url));
	}

	if (pathname.startsWith("/api")) {
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico|node_modules|heroImage.jpg|logo.png|google.png).*)",
	],
};
