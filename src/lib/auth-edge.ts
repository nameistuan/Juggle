// lib/auth-edge.ts
import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"

export async function middleware(req: Request) {
    const token = await getToken({ req })

    const isLoggedIn = !!token
    const isLoginPage = req.url.includes("/login")

    if (!isLoggedIn && !isLoginPage) {
        return NextResponse.redirect(new URL("/login", req.url))
    }

    return NextResponse.next()
}