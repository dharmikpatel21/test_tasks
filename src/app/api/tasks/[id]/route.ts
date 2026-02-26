import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const JSON_SERVER = "http://localhost:8000";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const res = await fetch(`${JSON_SERVER}/tasks/${id}`, { cache: "no-store" });
  if (!res.ok) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const task = await res.json();
  return NextResponse.json(task);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const updates = {
    ...body,
    updatedAt: new Date().toISOString(),
  };

  const res = await fetch(`${JSON_SERVER}/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 },
    );
  }

  const updated = await res.json();
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const res = await fetch(`${JSON_SERVER}/tasks/${id}`, { method: "DELETE" });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
