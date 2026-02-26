import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const JSON_SERVER = "http://localhost:8000";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Forward supported query params to json-server
  const { searchParams } = new URL(req.url);
  const params = new URLSearchParams();

  const status = searchParams.get("status");
  const q = searchParams.get("q");
  const page = searchParams.get("page");
  const limit = searchParams.get("limit");

  if (status) params.set("status", status);
  if (q) params.set("q", q);
  if (page) params.set("_page", page);
  if (limit) params.set("_per_page", limit); // json-server v1 pagination

  // ── Ownership filter ─────────────────────────────────────────────────────
  // Always scope tasks to the currently logged-in user.
  // Admins can bypass this by having an "admin" role — they see all tasks.
  if (payload.role !== "admin") {
    params.set("assignedTo", payload.userId);
  }
  // ────────────────────────────────────────────────────────────────────────

  const qs = params.toString();
  const url = `${JSON_SERVER}/tasks${qs ? `?${qs}` : ""}`;

  const res = await fetch(url, { cache: "no-store" });
  const raw = await res.json();

  // json-server v1 paginated response: { data: [], items: N, pages: N, ... }
  // Non-paginated (no _page) returns a plain array.
  const isPagedResponse =
    raw && typeof raw === "object" && !Array.isArray(raw) && "data" in raw;
  const tasks = isPagedResponse ? raw.data : raw;
  const totalCount = isPagedResponse
    ? raw.items
    : Number(
        res.headers.get("X-Total-Count") ??
          (Array.isArray(raw) ? raw.length : 0),
      );

  return NextResponse.json({ tasks, total: totalCount });
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
