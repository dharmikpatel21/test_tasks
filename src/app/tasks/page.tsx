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
} from "lucide-react";
import type { Task, TaskStatus } from "@/lib/api";

const statusConfig: Record<
  TaskStatus | "all",
  { label: string; color: string; bg: string; dot: string }
> = {
  all: {
    label: "All Tasks",
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.1)",
    dot: "#94a3b8",
  },
  pending: {
    label: "Pending",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    dot: "#f59e0b",
  },
  processing: {
    label: "Processing",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    dot: "#3b82f6",
  },
  complete: {
    label: "Complete",
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
    dot: "#10b981",
  },
};

const priorityConfig = {
  high: { label: "High", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  medium: { label: "Medium", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  low: { label: "Low", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
};

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const url = filter === "all" ? "/api/tasks" : `/api/tasks?status=${filter}`;
    let cancelled = false;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setTasks(Array.isArray(data) ? data : []);
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
  }, [filter]);

  const filtered = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()),
  );

  const counts = tasks.reduce(
    (acc, t) => {
      acc[t.status] = (acc[t.status] ?? 0) + 1;
      acc.all = (acc.all ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "32px 24px",
        color: "#f1f5f9",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 32,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 4,
            }}
          >
            <LayoutDashboard size={22} color="#6366f1" />
            <h1
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 700,
                color: "#f1f5f9",
                letterSpacing: "-0.5px",
              }}
            >
              Task Dashboard
            </h1>
          </div>
          <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>
            Manage and track your project tasks
          </p>
        </div>
        <button
          onClick={() => router.push("/tasks/new")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            border: "none",
            borderRadius: 10,
            color: "white",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
            transition: "opacity 0.2s, transform 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.9";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
            e.currentTarget.style.transform = "none";
          }}
        >
          <Plus size={16} strokeWidth={2.5} />
          New Task
        </button>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 14,
          marginBottom: 28,
        }}
      >
        {(["all", "pending", "processing", "complete"] as const).map((s) => {
          const cfg = statusConfig[s];
          return (
            <div
              key={s}
              onClick={() => setFilter(s)}
              style={{
                background: filter === s ? cfg.bg : "rgba(255,255,255,0.03)",
                border: `1px solid ${filter === s ? cfg.color + "40" : "rgba(255,255,255,0.07)"}`,
                borderRadius: 12,
                padding: "14px 16px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <div style={{ fontSize: 26, fontWeight: 700, color: cfg.color }}>
                {counts[s] ?? 0}
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                {cfg.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Tabs + Search */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            background: "rgba(255,255,255,0.04)",
            borderRadius: 10,
            padding: 3,
            border: "1px solid rgba(255,255,255,0.07)",
            gap: 2,
          }}
        >
          {(["all", "pending", "processing", "complete"] as const).map((s) => {
            const cfg = statusConfig[s];
            const active = filter === s;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: active ? cfg.bg : "transparent",
                  color: active ? cfg.color : "#64748b",
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {active && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: cfg.dot,
                    }}
                  />
                )}
                {cfg.label}
              </button>
            );
          })}
        </div>

        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#475569",
            }}
          />
          <input
            type="text"
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 9,
              padding: "8px 12px 8px 36px",
              fontSize: 13,
              color: "#f1f5f9",
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* Task Grid */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
          <Loader2
            size={32}
            color="#6366f1"
            style={{ animation: "spin 0.8s linear infinite" }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{ textAlign: "center", padding: "60px 0", color: "#475569" }}
        >
          <CheckCircle2
            size={48}
            style={{ margin: "0 auto 12px", opacity: 0.4 }}
          />
          <p style={{ fontSize: 16, margin: 0 }}>No tasks found</p>
          <p style={{ fontSize: 13, margin: "4px 0 0" }}>
            Try a different filter or create a new task
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 16,
          }}
        >
          {filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => router.push(`/tasks/${task.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const sc = statusConfig[task.status];
  const pc = priorityConfig[task.priority ?? "medium"];
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? "rgba(255,255,255,0.06)"
          : "rgba(255,255,255,0.03)",
        border: `1px solid ${hovered ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 14,
        padding: "18px 20px",
        cursor: "pointer",
        transition: "all 0.2s",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? "0 8px 32px rgba(0,0,0,0.3)" : "none",
      }}
    >
      {/* Top: Status + Priority */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: "3px 8px",
            borderRadius: 20,
            background: sc.bg,
            color: sc.color,
            display: "flex",
            alignItems: "center",
            gap: 5,
            textTransform: "capitalize",
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: sc.dot,
            }}
          />
          {task.status}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            padding: "3px 8px",
            borderRadius: 20,
            background: pc.bg,
            color: pc.color,
            textTransform: "capitalize",
          }}
        >
          {task.priority}
        </span>
      </div>

      {/* Title */}
      <h3
        style={{
          margin: "0 0 8px",
          fontSize: 15,
          fontWeight: 600,
          color: "#f1f5f9",
          lineHeight: 1.4,
        }}
      >
        {task.title}
      </h3>

      {/* Description */}
      <p
        style={{
          margin: "0 0 14px",
          fontSize: 13,
          color: "#64748b",
          lineHeight: 1.6,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {task.description}
      </p>

      {/* Technologies */}
      {task.technologies?.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginBottom: 14,
          }}
        >
          {task.technologies.slice(0, 4).map((tech) => (
            <span
              key={tech}
              style={{
                fontSize: 11,
                padding: "2px 8px",
                borderRadius: 6,
                background: "rgba(99,102,241,0.1)",
                color: "#a5b4fc",
                border: "1px solid rgba(99,102,241,0.15)",
              }}
            >
              {tech}
            </span>
          ))}
          {task.technologies.length > 4 && (
            <span style={{ fontSize: 11, color: "#475569" }}>
              +{task.technologies.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Footer: Deploy target + Date */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: "#475569",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Clock size={11} />
          {new Date(task.updatedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
        <span
          style={{
            fontSize: 11,
            color: "#475569",
            maxWidth: 140,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {task.deployTarget}
        </span>
      </div>
    </div>
  );
}
