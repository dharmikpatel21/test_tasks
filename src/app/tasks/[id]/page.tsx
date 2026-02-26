"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  ArrowLeft,
  Edit3,
  Save,
  X,
  Trash2,
  Loader2,
  Globe,
  Cpu,
  Target,
  AlignLeft,
  Lightbulb,
  Tag,
} from "lucide-react";
import type { Task, TaskStatus, TaskPriority } from "@/lib/api";

const statusOptions: { value: TaskStatus; label: string; color: string }[] = [
  { value: "pending", label: "Pending", color: "#f59e0b" },
  { value: "processing", label: "Processing", color: "#3b82f6" },
  { value: "complete", label: "Complete", color: "#10b981" },
];

const priorityOptions: { value: TaskPriority; label: string; color: string }[] =
  [
    { value: "high", label: "High", color: "#ef4444" },
    { value: "medium", label: "Medium", color: "#f59e0b" },
    { value: "low", label: "Low", color: "#10b981" },
  ];

interface FormData {
  title: string;
  description: string;
  approach: string;
  technologies: string;
  deployTarget: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string;
}

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  useEffect(() => {
    fetch(`/api/tasks/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data: Task) => {
        setTask(data);
        reset({
          title: data.title,
          description: data.description,
          approach: data.approach,
          technologies: data.technologies?.join(", ") ?? "",
          deployTarget: data.deployTarget,
          status: data.status,
          priority: data.priority,
          assignedTo: data.assignedTo,
        });
      })
      .catch(() => {
        toast.error("Task not found");
        router.push("/tasks");
      })
      .finally(() => setLoading(false));
  }, [id, reset, router]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          technologies: data.technologies
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error();
      const updated: Task = await res.json();
      setTask(updated);
      setEditing(false);
      toast.success("Task updated successfully!");
    } catch {
      toast.error("Failed to update task");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      toast.success("Task deleted");
      router.push("/tasks");
    } catch {
      toast.error("Failed to delete task");
      setDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      const updated: Task = await res.json();
      setTask(updated);
      reset({
        ...Object.fromEntries(
          Object.entries(task ?? {}).map(([k, v]) => [
            k,
            Array.isArray(v) ? (v as string[]).join(", ") : v,
          ]),
        ),
        status: newStatus,
      } as FormData);
      toast.success(`Moved to ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <Loader2
          size={36}
          color="#6366f1"
          style={{ animation: "spin 0.8s linear infinite" }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!task) return null;

  const sc = statusOptions.find((s) => s.value === task.status);
  const pc = priorityOptions.find((p) => p.value === task.priority);

  return (
    <div
      style={{
        maxWidth: 860,
        margin: "0 auto",
        padding: "32px 24px",
        color: "#f1f5f9",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Back */}
      <button
        onClick={() => router.back()}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          color: "#64748b",
          cursor: "pointer",
          fontSize: 14,
          marginBottom: 24,
          padding: 0,
        }}
      >
        <ArrowLeft size={16} /> Back to tasks
      </button>

      {/* Header card */}
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: "24px 28px",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: 20,
                  background: `${sc?.color}20`,
                  color: sc?.color,
                  textTransform: "capitalize",
                }}
              >
                {task.status}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  padding: "3px 10px",
                  borderRadius: 20,
                  background: `${pc?.color}20`,
                  color: pc?.color,
                  textTransform: "capitalize",
                }}
              >
                {task.priority} priority
              </span>
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 700,
                color: "#f1f5f9",
                letterSpacing: "-0.4px",
                lineHeight: 1.3,
              }}
            >
              {task.title}
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: 12, color: "#475569" }}>
              Updated{" "}
              {new Date(task.updatedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  background: "rgba(99,102,241,0.15)",
                  border: "1px solid rgba(99,102,241,0.3)",
                  borderRadius: 9,
                  color: "#a5b4fc",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                <Edit3 size={14} /> Edit
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: 9,
                color: "#f87171",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              <Trash2 size={14} /> {deleting ? "…" : "Delete"}
            </button>
          </div>
        </div>

        {/* Status move buttons */}
        <div
          style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}
        >
          <span style={{ fontSize: 12, color: "#475569", alignSelf: "center" }}>
            Move to:
          </span>
          {statusOptions
            .filter((s) => s.value !== task.status)
            .map((s) => (
              <button
                key={s.value}
                onClick={() => handleStatusChange(s.value)}
                style={{
                  padding: "5px 14px",
                  borderRadius: 8,
                  border: `1px solid ${s.color}40`,
                  background: `${s.color}12`,
                  color: s.color,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {s.label}
              </button>
            ))}
        </div>
      </div>

      {/* Form / Detail */}
      {editing ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(99,102,241,0.2)",
              borderRadius: 16,
              padding: "24px 28px",
            }}
          >
            <h2
              style={{
                margin: "0 0 20px",
                fontSize: 16,
                fontWeight: 600,
                color: "#e2e8f0",
              }}
            >
              Edit Task
            </h2>

            <div style={{ display: "grid", gap: 18 }}>
              <Field
                label="Title"
                icon={<Tag size={14} />}
                error={errors.title?.message}
              >
                <input
                  {...register("title", { required: "Title is required" })}
                  className="edit-input"
                />
              </Field>

              <Field
                label="Description"
                icon={<AlignLeft size={14} />}
                error={errors.description?.message}
              >
                <textarea
                  {...register("description", {
                    required: "Description is required",
                  })}
                  rows={4}
                  className="edit-input"
                  style={{ resize: "vertical" }}
                />
              </Field>

              <Field
                label="Approach / Steps"
                icon={<Lightbulb size={14} />}
                error={errors.approach?.message}
              >
                <textarea
                  {...register("approach", {
                    required: "Approach is required",
                  })}
                  rows={4}
                  className="edit-input"
                  style={{ resize: "vertical" }}
                />
              </Field>

              <Field
                label="Technologies (comma-separated)"
                icon={<Cpu size={14} />}
              >
                <input
                  {...register("technologies")}
                  placeholder="React, Next.js, TypeScript"
                  className="edit-input"
                />
              </Field>

              <Field label="Deploy Target" icon={<Globe size={14} />}>
                <input
                  {...register("deployTarget")}
                  placeholder="Vercel, Railway, etc."
                  className="edit-input"
                />
              </Field>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <Field label="Status" icon={<Target size={14} />}>
                  <select {...register("status")} className="edit-input">
                    {statusOptions.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Priority" icon={<Target size={14} />}>
                  <select {...register("priority")} className="edit-input">
                    {priorityOptions.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "10px 20px",
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  border: "none",
                  borderRadius: 10,
                  color: "white",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                }}
              >
                {saving ? (
                  <Loader2
                    size={15}
                    style={{ animation: "spin 0.8s linear infinite" }}
                  />
                ) : (
                  <Save size={15} />
                )}
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "10px 20px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  color: "#94a3b8",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                <X size={15} /> Cancel
              </button>
            </div>
          </div>

          <style>{`
            .edit-input {
              width: 100%; box-sizing: border-box;
              background: rgba(255,255,255,0.05);
              border: 1px solid rgba(255,255,255,0.1);
              border-radius: 9px; padding: 10px 13px;
              font-size: 14px; color: #f1f5f9; outline: none;
              font-family: inherit;
              transition: border-color 0.2s, box-shadow 0.2s;
            }
            .edit-input:focus {
              border-color: #6366f1;
              box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
            }
            .edit-input option { background: #1e1e3a; }
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>
        </form>
      ) : (
        /* Read-only view */
        <div style={{ display: "grid", gap: 16 }}>
          <DetailSection
            icon={<AlignLeft size={16} color="#6366f1" />}
            title="Description"
          >
            <p
              style={{
                margin: 0,
                fontSize: 14,
                color: "#94a3b8",
                lineHeight: 1.75,
                whiteSpace: "pre-wrap",
              }}
            >
              {task.description}
            </p>
          </DetailSection>

          <DetailSection
            icon={<Lightbulb size={16} color="#f59e0b" />}
            title="Approach"
          >
            <p
              style={{
                margin: 0,
                fontSize: 14,
                color: "#94a3b8",
                lineHeight: 1.75,
                whiteSpace: "pre-wrap",
              }}
            >
              {task.approach}
            </p>
          </DetailSection>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <DetailSection
              icon={<Cpu size={16} color="#10b981" />}
              title="Technologies"
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {task.technologies?.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: 12,
                      padding: "4px 10px",
                      borderRadius: 7,
                      background: "rgba(99,102,241,0.12)",
                      color: "#a5b4fc",
                      border: "1px solid rgba(99,102,241,0.2)",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </DetailSection>

            <DetailSection
              icon={<Globe size={16} color="#3b82f6" />}
              title="Deploy Target"
            >
              <p style={{ margin: 0, fontSize: 14, color: "#94a3b8" }}>
                {task.deployTarget}
              </p>
            </DetailSection>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
            }}
          >
            {[
              {
                label: "Created",
                value: new Date(task.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }),
              },
              {
                label: "Last Updated",
                value: new Date(task.updatedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }),
              },
              { label: "Assigned To", value: task.assignedTo },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 12,
                  padding: "16px 18px",
                }}
              >
                <p
                  style={{
                    margin: "0 0 4px",
                    fontSize: 11,
                    color: "#475569",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    color: "#cbd5e1",
                    fontWeight: 500,
                  }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          fontWeight: 500,
          color: "#94a3b8",
          marginBottom: 7,
        }}
      >
        {icon} {label}
      </label>
      {children}
      {error && (
        <p style={{ margin: "5px 0 0", fontSize: 12, color: "#f43f5e" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function DetailSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14,
        padding: "20px 22px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        {icon}
        <h3
          style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}
        >
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}
