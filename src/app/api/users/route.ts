import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const JSON_SERVER = "http://localhost:8000";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(`${JSON_SERVER}/users`, { cache: "no-store" });
  const users = await res.json();

  // Strip passwords before sending to client
  // Strip password from each user before sending to the client
  const safe = users.map((u: Record<string, unknown>) =>
    Object.fromEntries(Object.entries(u).filter(([k]) => k !== "password")),
  );
  return NextResponse.json(safe);
}
