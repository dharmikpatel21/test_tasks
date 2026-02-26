import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const JSON_SERVER = "http://localhost:8000";

/** Fetch task and verify the caller owns it (or is admin). Returns null if not allowed. */
async function getTaskAndVerifyOwnership(
  taskId: string,
  userId: string,
  role: string,
): Promise<Record<string, unknown> | null> {
  const res = await fetch(`${JSON_SERVER}/tasks/${taskId}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const task = (await res.json()) as Record<string, unknown>;
  if (role !== "admin" && task.assignedTo !== userId) return null;
  return task;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = req.cookies.get("auth-token")?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const task = await getTaskAndVerifyOwnership(
    id,
    payload.userId,
    payload.role,
  );
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json(task);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = req.cookies.get("auth-token")?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify ownership before allowing edits
  const existing = await getTaskAndVerifyOwnership(
    id,
    payload.userId,
    payload.role,
  );
  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const body = await req.json();
  const updates = { ...body, updatedAt: new Date().toISOString() };

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

  return NextResponse.json(await res.json());
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = req.cookies.get("auth-token")?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify ownership before allowing deletion
  const existing = await getTaskAndVerifyOwnership(
    id,
    payload.userId,
    payload.role,
  );
  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const res = await fetch(`${JSON_SERVER}/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
