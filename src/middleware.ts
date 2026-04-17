import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"

export default NextAuth(authConfig).auth

export const config = {
  // Matching everything except static files and icons
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}