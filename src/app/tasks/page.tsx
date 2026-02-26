"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Clock,
  Loader2,
  CheckCircle2,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@/lib/api";

const ITEMS_PER_PAGE = 6;

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

const tabLabels: Record<string, string> = {
  all: "All",
  pending: "Pending",
  processing: "Processing",
  complete: "Complete",
};

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const [search, setSearch] = useState("");
  // Track the last filter+search combo so we know when to reset page
  const [pageKey, setPageKey] = useState("");
  const [page, setPage] = useState(1);

  // Always fetch ALL tasks so counts are always accurate
  useEffect(() => {
    let cancelled = false;
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) {
          setTasks(Array.isArray(d) ? d : []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTasks([]);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []); // fetch once — filtering is done client-side

  // When filter or search change, update pageKey (which drives page reset)
  const nextKey = `${filter}::${search}`;
  if (nextKey !== pageKey) {
    setPageKey(nextKey);
    setPage(1);
  }

  // Counts always from full task list (unaffected by filter)
  const counts = tasks.reduce(
    (acc, t) => {
      acc[t.status] = (acc[t.status] ?? 0) + 1;
      acc.all = (acc.all ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Apply status tab filter first, then search
  const statusFiltered =
    filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  const filtered = statusFiltered.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(pageStart, pageStart + ITEMS_PER_PAGE);

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
          onClick={() => router.push("/tasks/new")}
          className="bg-linear-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 shadow-lg shadow-primary/20 font-semibold gap-2"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          New Task
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["all", "pending", "processing", "complete"] as const).map((s) => {
          const { badge } = statusStyle[s];
          const isActive = filter === s;
          return (
            <Card
              key={s}
              onClick={() => setFilter(s)}
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
                  {tabLabels[s]}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters + Search */}
      <div className="flex flex-wrap items-center gap-3">
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as TaskStatus | "all")}
        >
          <TabsList className="bg-card/60 border border-border/50">
            {(["all", "pending", "processing", "complete"] as const).map(
              (s) => (
                <TabsTrigger
                  key={s}
                  value={s}
                  className="text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none"
                >
                  {tabLabels[s]}
                </TabsTrigger>
              ),
            )}
          </TabsList>
        </Tabs>

        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks…"
            className="pl-9 bg-card/60 border-border/50 text-sm h-9"
          />
        </div>
      </div>

      {/* Task Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-muted-foreground gap-3">
          <CheckCircle2 className="h-12 w-12 opacity-30" />
          <p className="text-base font-medium">No tasks found</p>
          <p className="text-sm">Try a different filter or create a new task</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => router.push(`/tasks/${task.id}`)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              {/* Showing X – Y of Z */}
              <p className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {pageStart + 1}–
                  {Math.min(pageStart + ITEMS_PER_PAGE, filtered.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {filtered.length}
                </span>{" "}
                tasks
              </p>

              <Pagination>
                <PaginationContent className="gap-1">
                  {/* Prev */}
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={safePage === 1}
                      className="h-8 gap-1.5 border-border/50 text-xs"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Prev
                    </Button>
                  </PaginationItem>

                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <PaginationItem key={p}>
                        <Button
                          variant={safePage === p ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setPage(p)}
                          className={cn(
                            "h-8 w-8 p-0 text-xs",
                            safePage === p
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {p}
                        </Button>
                      </PaginationItem>
                    ),
                  )}

                  {/* Next */}
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={safePage === totalPages}
                      className="h-8 gap-1.5 border-border/50 text-xs"
                    >
                      Next
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const { badge: sBadge, dot } = statusStyle[task.status];
  const pBadge = priorityStyle[task.priority ?? "medium"];

  return (
    <Card
      onClick={onClick}
      className="group cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-black/30 bg-card/60 border-border/50"
    >
      <CardContent className="p-5 space-y-3">
        {/* Status + Priority */}
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
            className={cn("text-[11px] font-medium border capitalize", pBadge)}
          >
            {task.priority}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {task.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {task.description}
        </p>

        {/* Tech chips */}
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

        {/* Footer */}
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
  );
}
