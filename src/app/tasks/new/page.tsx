"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Loader2,
  Globe,
  Cpu,
  Target,
  AlignLeft,
  Lightbulb,
  Tag,
} from "lucide-react";
import type { TaskStatus, TaskPriority } from "@/lib/api";

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

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "complete", label: "Complete" },
];

const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export default function NewTaskPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      status: "pending",
      priority: "medium",
    },
  });

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
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
      const created = await res.json();
      toast.success("Task created successfully!");
      router.push(`/tasks/${created.id}`);
    } catch {
      toast.error("Failed to create task");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "32px 24px",
        color: "#f1f5f9",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
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
        <ArrowLeft size={16} /> Back
      </button>

      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 4,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Plus size={18} color="white" strokeWidth={2.5} />
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 700,
              color: "#f1f5f9",
              letterSpacing: "-0.4px",
            }}
          >
            Create New Task
          </h1>
        </div>
        <p style={{ margin: "4px 0 0 46px", fontSize: 13, color: "#64748b" }}>
          Fill in the details to add a new task to your board
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: "28px",
          }}
        >
          <div style={{ display: "grid", gap: 20 }}>
            <Field
              label="Task Title"
              icon={<Tag size={14} />}
              error={errors.title?.message}
              required
            >
              <input
                {...register("title", { required: "Title is required" })}
                placeholder="What needs to be done?"
                className="task-input"
              />
            </Field>

            <Field
              label="Description"
              icon={<AlignLeft size={14} />}
              error={errors.description?.message}
              required
            >
              <textarea
                {...register("description", {
                  required: "Description is required",
                })}
                placeholder="Describe what this task involves…"
                rows={4}
                className="task-input"
                style={{ resize: "vertical" }}
              />
            </Field>

            <Field
              label="Approach / Steps"
              icon={<Lightbulb size={14} />}
              error={errors.approach?.message}
              required
            >
              <textarea
                {...register("approach", { required: "Approach is required" })}
                placeholder="How should this be approached? List the steps…"
                rows={4}
                className="task-input"
                style={{ resize: "vertical" }}
              />
            </Field>

            <Field
              label="Technologies (comma-separated)"
              icon={<Cpu size={14} />}
            >
              <input
                {...register("technologies")}
                placeholder="React, Next.js, TypeScript, PostgreSQL"
                className="task-input"
              />
            </Field>

            <Field label="Deploy Target" icon={<Globe size={14} />}>
              <input
                {...register("deployTarget")}
                placeholder="Vercel, Railway, AWS, etc."
                className="task-input"
              />
            </Field>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 16,
              }}
            >
              <Field label="Status" icon={<Target size={14} />}>
                <select {...register("status")} className="task-input">
                  {statusOptions.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Priority" icon={<Target size={14} />}>
                <select {...register("priority")} className="task-input">
                  {priorityOptions.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Assign To (User ID)" icon={<Target size={14} />}>
                <input
                  {...register("assignedTo")}
                  placeholder="u1, u2…"
                  className="task-input"
                />
              </Field>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "11px 22px",
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
              <Plus size={15} />
            )}
            {saving ? "Creating…" : "Create Task"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              padding: "11px 22px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              color: "#94a3b8",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>

        <style>{`
          .task-input {
            width: 100%; box-sizing: border-box;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 9px; padding: 10px 13px;
            font-size: 14px; color: #f1f5f9; outline: none;
            font-family: inherit;
            transition: border-color 0.2s, box-shadow 0.2s;
          }
          .task-input::placeholder { color: #334155; }
          .task-input:focus {
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
          }
          .task-input option { background: #1e1e3a; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </form>
    </div>
  );
}

function Field({
  label,
  icon,
  error,
  required = false,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  required?: boolean;
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
        {icon} {label} {required && <span style={{ color: "#f43f5e" }}>*</span>}
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
