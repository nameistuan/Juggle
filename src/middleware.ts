// middleware.ts
export { middleware } from "@/lib/auth-edge"

export const config = {
  matcher: [
    "/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)",
  ],
}