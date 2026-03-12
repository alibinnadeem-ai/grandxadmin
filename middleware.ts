import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

interface JWTPayload {
  userId: number;
  username: string;
  role: string;
}

const protectedPaths = [
  "/dashboard",
  "/admin",
  "/apis",
  "/api/users",
  "/api/apis",
];

const adminOnlyPaths = ["/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is a protected path
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    // Redirect to login for protected pages
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const user = await verifyToken(token);
  if (!user) {
    // Redirect to login for protected pages
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check admin-only paths
  const isAdminPath = adminOnlyPaths.some((path) =>
    pathname.startsWith(path)
  );

  const userPayload = user as JWTPayload;
  if (isAdminPath && userPayload.role !== "Admin") {
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
