import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { verifyCognitoToken } from "./lib/jwt";
import { cache } from "react";

const verifyCognitoTokenCached = cache(verifyCognitoToken);

function isAdmin(decoded: unknown): boolean {
  if (!decoded || typeof decoded !== "object") return false;
  const groups = (decoded as Record<string, unknown>)["cognito:groups"];
  return Array.isArray(groups) && groups.includes("admin");
}

export async function proxy(req: NextRequest) {
  const protectedRoutes = ["/admin", "/dashboard"];
  const isProtected = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get("cog_token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const decoded = await verifyCognitoTokenCached(token);
    if (!isAdmin(decoded)) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
