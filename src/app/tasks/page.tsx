import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Clock, LayoutDashboard, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Suspense } from "react";
import { cn } from "@/lib/utils";
// TaskFilters and TaskPagination use Radix UI which generates random IDs —
// they're imported via a "use client" wrapper that marks them ssr:false
// so IDs are only ever generated client-side (prevents hydration mismatch).
import { TaskFilters, TaskPagination } from "./_components/DynamicComponents";
import type { Task, TaskStatus } from "@/lib/api";

const PAGE_SIZE = 6;
const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const statusStyle: Record<TaskStatus | "all", { badge: string; dot: string }> =
  {
    all: { badge: "bg-muted text-muted-foreground", dot: "bg-slate-400" },
    pending: {
      badge: "bg-amber-500/15 text-amber-400 border-amber-500/20",
      dot: "bg-amber-400",
    },
    processing: {
      badge: "bg-blue-500/15 text-blue-400 border-blue-500/20",
      dot: "bg-blue-400",
    },
    complete: {
      badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
      dot: "bg-emerald-400",
    },
  };

const priorityStyle: Record<string, string> = {
  high: "bg-red-500/15 text-red-400 border-red-500/20",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  low: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
};

// ── Server-side fetch helpers ────────────────────────────────────────────────

async function getCookieHeader() {
  const cookieStore = await cookies();
  return cookieStore.toString();
}

async function fetchTasks({
  status,
  q,
  page,
}: {
  status?: string;
  q?: string;
  page?: number;
}) {
  const params = new URLSearchParams();
  if (status && status !== "all") params.set("status", status);
  if (q) params.set("q", q);
  if (page) params.set("page", String(page));
  params.set("limit", String(PAGE_SIZE));

  const cookieHeader = await getCookieHeader();
  const qs = params.toString();
  const res = await fetch(`${BASE}/api/tasks${qs ? `?${qs}` : ""}`, {
    cache: "no-store",
    headers: { Cookie: cookieHeader },
  });

  if (res.status === 401) redirect("/login");

  // API now returns { tasks: Task[], total: number }
  const body = await res.json();
  const tasks: Task[] = Array.isArray(body) ? body : (body.tasks ?? []);
  const totalCount: number = body.total ?? tasks.length;
  return { tasks, totalCount };
}

/** Fetch ALL tasks (no filter) to compute accurate status counts */
async function fetchAllCounts(): Promise<Record<string, number>> {
  const cookieHeader = await getCookieHeader();
  const res = await fetch(`${BASE}/api/tasks`, {
    cache: "no-store",
    headers: { Cookie: cookieHeader },
  });
  if (!res.ok) return {};

  const body = await res.json();
  const all: Task[] = Array.isArray(body) ? body : (body.tasks ?? []);
  return all.reduce(
    (acc, t) => {
      acc[t.status] = (acc[t.status] ?? 0) + 1;
      acc.all = (acc.all ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}

export default async function TasksPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const filter = sp.status ?? "all";
  const search = sp.q ?? "";
  const page = Math.max(1, Number(sp.page ?? 1));

  // Parallel server-side fetches
  const [{ tasks, totalCount }, counts] = await Promise.all([
    fetchTasks({ status: filter, q: search, page }),
    fetchAllCounts(),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">
              Task Dashboard
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage and track your project tasks
          </p>
        </div>
        <Button
          asChild
          className="bg-linear-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 shadow-lg shadow-primary/20 font-semibold gap-2"
        >
          <Link href="/tasks/new">
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            New Task
          </Link>
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["all", "pending", "processing", "complete"] as const).map((s) => {
          const { badge } = statusStyle[s];
          const isActive = filter === s;
          const href = s === "all" ? "/tasks" : `/tasks?status=${s}`;
          return (
            <Link key={s} href={href}>
              <Card
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:-translate-y-0.5",
                  isActive
                    ? "border-primary/30 bg-primary/5"
                    : "border-border/50 bg-card/60 hover:border-border",
                )}
              >
                <CardContent className="pt-4 pb-3 px-4">
                  <p
                    className={cn(
                      "text-3xl font-bold mb-1",
                      isActive ? "text-primary" : "text-foreground",
                    )}
                  >
                    {counts[s] ?? 0}
                  </p>
                  <Badge
                    variant="outline"
                    className={cn("text-[11px] font-medium border", badge)}
                  >
                    {s === "all"
                      ? "All"
                      : s.charAt(0).toUpperCase() + s.slice(1)}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Filters — client component */}
      <Suspense>
        <TaskFilters
          counts={counts}
          activeFilter={filter}
          activeSearch={search}
        />
      </Suspense>

      {/* Task Grid */}
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-muted-foreground gap-3">
          <CheckCircle2 className="h-12 w-12 opacity-30" />
          <p className="text-base font-medium">No tasks found</p>
          <p className="text-sm">Try a different filter or create a new task</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>

          {/* Pagination — client component */}
          <Suspense>
            <TaskPagination
              currentPage={page}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={PAGE_SIZE}
            />
          </Suspense>
        </>
      )}
    </div>
  );
}

// ── Task card (pure display — no interactivity needed, kept as server component) ──

function TaskCard({ task }: { task: Task }) {
  const { badge: sBadge, dot } = statusStyle[task.status];
  const pBadge = priorityStyle[task.priority ?? "medium"];

  return (
    <Link href={`/tasks/${task.id}`}>
      <Card className="group cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-black/30 bg-card/60 border-border/50 h-full">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className={cn("text-[11px] font-semibold border gap-1.5", sBadge)}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
              {task.status}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "text-[11px] font-medium border capitalize",
                pBadge,
              )}
            >
              {task.priority}
            </Badge>
          </div>

          <h3 className="font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {task.title}
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {task.description}
          </p>

          {task.technologies?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {task.technologies.slice(0, 4).map((tech) => (
                <span
                  key={tech}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-primary/10 text-primary/80 border border-primary/15 font-medium"
                >
                  {tech}
                </span>
              ))}
              {task.technologies.length > 4 && (
                <span className="text-[11px] text-muted-foreground self-center">
                  +{task.technologies.length - 4}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-border/50">
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              {new Date(task.updatedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="text-[11px] text-muted-foreground/70 truncate max-w-[140px]">
              {task.deployTarget}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
