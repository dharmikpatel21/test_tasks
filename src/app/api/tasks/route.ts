import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const JSON_SERVER = "http://localhost:8000";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const url = status
    ? `${JSON_SERVER}/tasks?status=${status}`
    : `${JSON_SERVER}/tasks`;

  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const now = new Date().toISOString();

  const task = {
    ...body,
    status: body.status ?? "pending",
    createdBy: payload.userId,
    createdAt: now,
    updatedAt: now,
  };

  const res = await fetch(`${JSON_SERVER}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 },
    );
  }

  const created = await res.json();
  return NextResponse.json(created, { status: 201 });
}
