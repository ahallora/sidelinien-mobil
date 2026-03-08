import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "./lib/session";

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();
  // Using iron-session/edge for Next.js middleware
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  // Allow access to public resources, login page, and Next.js internal paths
  if (
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.startsWith("/api/access") ||
    req.nextUrl.pathname === "/access" ||
    req.nextUrl.pathname === "/favicon.ico" ||
    req.nextUrl.pathname.includes(".")
  ) {
    return res;
  }

  // Check if they have site access
  if (!session.siteAccess) {
    if (req.nextUrl.pathname.startsWith("/api")) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized site access" }),
        { status: 401, headers: { "content-type": "application/json" } },
      );
    }
    // Redirect to access page
    const url = req.nextUrl.clone();
    url.pathname = "/access";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
