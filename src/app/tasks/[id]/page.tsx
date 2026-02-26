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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus, TaskPriority } from "@/lib/api";

const statusBadge: Record<TaskStatus, string> = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  processing: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  complete: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
};

const priorityBadge: Record<TaskPriority, string> = {
  high: "bg-red-500/15 text-red-400 border-red-500/20",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  low: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
};

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
    setValue,
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
      toast.success("Task updated!");
    } catch {
      toast.error("Failed to update task");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this task?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      toast.success("Task deleted");
      router.push("/tasks");
    } catch {
      toast.error("Failed to delete");
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
      setValue("status", newStatus);
      toast.success(`Moved to ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!task) return null;

  const statusMoves = (
    ["pending", "processing", "complete"] as TaskStatus[]
  ).filter((s) => s !== task.status);

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-5">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="text-muted-foreground -ml-2"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Back to tasks
      </Button>

      {/* Header Card */}
      <Card className="border-border/50 bg-card/60">
        <CardContent className="p-6 space-y-4">
          {/* Badges + actions row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className={cn("capitalize border", statusBadge[task.status])}
              >
                {task.status}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "capitalize border",
                  priorityBadge[task.priority ?? "medium"],
                )}
              >
                {task.priority} priority
              </Badge>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {!editing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(true)}
                  className="border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
                >
                  <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Edit
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />{" "}
                {deleting ? "…" : "Delete"}
              </Button>
            </div>
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground leading-snug">
              {task.title}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Updated{" "}
              {new Date(task.updatedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Status move buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-muted-foreground">Move to:</span>
            {statusMoves.map((s) => (
              <Button
                key={s}
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange(s)}
                className={cn(
                  "capitalize text-xs h-7",
                  statusBadge[s],
                  "border hover:opacity-80",
                )}
              >
                {s}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      {editing ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="border-primary/20 bg-card/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Edit Task</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2 space-y-5">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-muted-foreground">
                  <Tag className="h-3.5 w-3.5" /> Title
                </Label>
                <Input
                  {...register("title", { required: "Required" })}
                  className="bg-white/5 border-white/10 focus:border-primary"
                />
                {errors.title && (
                  <p className="text-xs text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-muted-foreground">
                  <AlignLeft className="h-3.5 w-3.5" /> Description
                </Label>
                <Textarea
                  {...register("description", { required: "Required" })}
                  rows={4}
                  className="bg-white/5 border-white/10 focus:border-primary resize-y"
                />
                {errors.description && (
                  <p className="text-xs text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-muted-foreground">
                  <Lightbulb className="h-3.5 w-3.5" /> Approach / Steps
                </Label>
                <Textarea
                  {...register("approach", { required: "Required" })}
                  rows={4}
                  className="bg-white/5 border-white/10 focus:border-primary resize-y"
                />
                {errors.approach && (
                  <p className="text-xs text-destructive">
                    {errors.approach.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-muted-foreground">
                  <Cpu className="h-3.5 w-3.5" /> Technologies{" "}
                  <span className="text-xs font-normal">(comma-separated)</span>
                </Label>
                <Input
                  {...register("technologies")}
                  placeholder="React, Next.js, TypeScript"
                  className="bg-white/5 border-white/10 focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-muted-foreground">
                  <Globe className="h-3.5 w-3.5" /> Deploy Target
                </Label>
                <Input
                  {...register("deployTarget")}
                  placeholder="Vercel, Railway…"
                  className="bg-white/5 border-white/10 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground">Status</Label>
                  <Select
                    defaultValue={task.status}
                    onValueChange={(v) => setValue("status", v as TaskStatus)}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="complete">Complete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground">Priority</Label>
                  <Select
                    defaultValue={task.priority}
                    onValueChange={(v) =>
                      setValue("priority", v as TaskPriority)
                    }
                  >
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator className="bg-border/50" />

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-primary to-violet-600 shadow-md shadow-primary/20"
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditing(false)}
                  className="border-border/50"
                >
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      ) : (
        /* Read-only cards */
        <div className="grid gap-4">
          <DetailCard
            icon={<AlignLeft className="h-4 w-4 text-primary" />}
            title="Description"
          >
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {task.description}
            </p>
          </DetailCard>

          <DetailCard
            icon={<Lightbulb className="h-4 w-4 text-amber-400" />}
            title="Approach"
          >
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {task.approach}
            </p>
          </DetailCard>

          <div className="grid sm:grid-cols-2 gap-4">
            <DetailCard
              icon={<Cpu className="h-4 w-4 text-emerald-400" />}
              title="Technologies"
            >
              <div className="flex flex-wrap gap-2">
                {task.technologies?.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2.5 py-1 rounded-md bg-primary/10 text-primary/80 border border-primary/15 font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </DetailCard>

            <DetailCard
              icon={<Globe className="h-4 w-4 text-blue-400" />}
              title="Deploy Target"
            >
              <p className="text-sm text-muted-foreground">
                {task.deployTarget}
              </p>
            </DetailCard>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: "Created",
                value: new Date(task.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }),
              },
              {
                label: "Last Updated",
                value: new Date(task.updatedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }),
              },
              { label: "Assigned To", value: task.assignedTo },
            ].map(({ label, value }) => (
              <Card key={label} className="border-border/40 bg-card/40">
                <CardContent className="p-4">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">
                    {label}
                  </p>
                  <p className="text-sm font-medium text-foreground">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-border/40 bg-card/50">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
