// lib/auth-edge.ts
import { getToken } from "next-auth/jwt"
import { NextResponse, NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
    const token = await getToken({ req })

    const isLoggedIn = !!token
    const { pathname } = req.nextUrl

    // 1. If user is logged in, and tries to go to /login, send them to home
    if (isLoggedIn && pathname === "/login") {
        return NextResponse.redirect(new URL("/", req.url))
    }

    // 2. If user is NOT logged in, and is on a protected page, send to /login
    // We exclude /login, /api/auth, and static files
    const isPublicPage = pathname === "/login" || pathname.startsWith("/api/auth")
    
    if (!isLoggedIn && !isPublicPage) {
        return NextResponse.redirect(new URL("/login", req.url))
    }

    return NextResponse.next()
}