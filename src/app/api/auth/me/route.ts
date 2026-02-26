import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const JSON_SERVER = "http://localhost:8000";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 },
    );
  }

  // Fetch fresh user data from JSON server
  const userRes = await fetch(`${JSON_SERVER}/users/${payload.userId}`, {
    cache: "no-store",
  });

  if (!userRes.ok) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const user = await userRes.json();
  const { password: _pw, ...safeUser } = user;

  return NextResponse.json({ user: safeUser });
}
