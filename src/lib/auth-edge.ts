import { getToken } from "next-auth/jwt"
import { NextResponse, NextRequest } from "next/server"

// On Vercel, we must pass the secret explicitly to getToken in Middleware
const secret = process.env.AUTH_SECRET

export async function middleware(req: NextRequest) {
    const token = await getToken({ 
        req, 
        secret
    })

    const isLoggedIn = !!token
    const { pathname } = req.nextUrl

    // Allow static files, api auth, and the login page
    const isPublicPage = 
        pathname === "/login" || 
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/_next") ||
        pathname === "/favicon.ico"

    if (isLoggedIn && pathname === "/login") {
        return NextResponse.redirect(new URL("/", req.url))
    }

    if (!isLoggedIn && !isPublicPage) {
        return NextResponse.redirect(new URL("/login", req.url))
    }

    return NextResponse.next()
}