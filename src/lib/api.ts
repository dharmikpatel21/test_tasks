const JSON_SERVER = "http://localhost:8000";

// ─── Task Types ───────────────────────────────────────────────────────────────

export type TaskStatus = "pending" | "processing" | "complete";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string;
  approach: string;
  technologies: string[];
  deployTarget: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  createdAt: string;
}

// ─── Task API helpers ─────────────────────────────────────────────────────────

export async function getTasks(status?: TaskStatus): Promise<Task[]> {
  const url = status ? `/api/tasks?status=${status}` : `/api/tasks`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

export async function getTask(id: string): Promise<Task> {
  const res = await fetch(`/api/tasks/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Task not found");
  return res.json();
}

export async function createTask(
  data: Omit<Task, "id" | "createdAt" | "updatedAt">,
): Promise<Task> {
  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json();
}

export async function updateTask(
  id: string,
  data: Partial<Omit<Task, "id" | "createdAt">>,
): Promise<Task> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete task");
}

// ─── Direct JSON-server helpers (server-side only) ───────────────────────────

export async function getTasksFromDB(status?: TaskStatus): Promise<Task[]> {
  const url = status
    ? `${JSON_SERVER}/tasks?status=${status}`
    : `${JSON_SERVER}/tasks`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function getTaskFromDB(id: string): Promise<Task | null> {
  const res = await fetch(`${JSON_SERVER}/tasks/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}
