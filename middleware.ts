import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // Define public paths that don't require authentication
    const isPublicPath =
        path === "/" ||
        path === "/login" ||
        path === "/cadastro" ||
        path === "/termos" ||
        path === "/privacidade" ||
        path.startsWith("/api/public")

    // Skip middleware for API routes except those that explicitly need auth checks
    const isApiPath = path.startsWith("/api/")
    const isProtectedApiPath =
        path.startsWith("/api/demand/create") || path.startsWith("/api/demand/update") || path.startsWith("/api/player/")

    // Skip middleware for non-protected API routes
    if (isApiPath && !isProtectedApiPath) {
        return NextResponse.next()
    }

    // Get the token and extract role information
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    })

    // Check if the path requires authentication
    const isAuthenticatedPath = path.startsWith("/authenticated")

    // Check if the path requires admin access
    const isAdminPath = path.startsWith("/authenticated/admin")

    // Check if the path requires public admin access
    const isPublicAdminPath = path.startsWith("/authenticated/dashboard")

    // If the path is not public and there's no token, redirect to login
    if (!isPublicPath && !token) {
        return NextResponse.redirect(new URL("/login", request.url))
    }

    // If trying to access authenticated area without a token
    if (isAuthenticatedPath && !token) {
        return NextResponse.redirect(new URL("/login", request.url))
    }

    // If trying to access admin area without admin role
    if (isAdminPath && token?.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url))
    }

    // If trying to access public admin area without public admin role
    if (isPublicAdminPath && !token?.publicAdminRole) {
        return NextResponse.redirect(new URL("/", request.url))
    }

    // If we're on the login page and we have a token, redirect to home
    if (path === "/login" && token) {
        return NextResponse.redirect(new URL("/", request.url))
    }

    // Log the request (you might want to use a proper logging service in production)
    console.log(
        `[${new Date().toISOString()}] ${request.method} ${path} - User Role: ${token?.role}, Public Admin Role: ${token?.publicAdminRole}`,
    )

    return NextResponse.next()
}

// Specify which routes this middleware should run for
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public (public files)
         */
        "/((?!_next/static|_next/image|favicon.ico|public).*)",
    ],
}

