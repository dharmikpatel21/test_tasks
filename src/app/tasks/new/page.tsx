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
  AlignLeft,
  Lightbulb,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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

export default function NewTaskPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { status: "pending", priority: "medium" },
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
      toast.success("Task created!");
      router.push(`/tasks/${created.id}`);
    } catch {
      toast.error("Failed to create task");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-5">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="text-muted-foreground -ml-2"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
      </Button>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-primary to-violet-600 shadow-lg shadow-primary/25">
          <Plus className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Create New Task</h1>
          <p className="text-sm text-muted-foreground">
            Fill in the details to add a task to your board
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="border-border/50 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Task Details</CardTitle>
            <CardDescription>
              All fields marked with * are required
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-2 space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-muted-foreground">
                <Tag className="h-3.5 w-3.5" /> Title{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                {...register("title", { required: "Title is required" })}
                placeholder="What needs to be done?"
                className="bg-white/5 border-white/10 focus:border-primary"
              />
              {errors.title && (
                <p className="text-xs text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-muted-foreground">
                <AlignLeft className="h-3.5 w-3.5" /> Description{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Textarea
                {...register("description", {
                  required: "Description is required",
                })}
                placeholder="Describe what this task involves…"
                rows={4}
                className="bg-white/5 border-white/10 focus:border-primary resize-y"
              />
              {errors.description && (
                <p className="text-xs text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Approach */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-muted-foreground">
                <Lightbulb className="h-3.5 w-3.5" /> Approach / Steps{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Textarea
                {...register("approach", { required: "Approach is required" })}
                placeholder="How should this be approached? List the steps…"
                rows={4}
                className="bg-white/5 border-white/10 focus:border-primary resize-y"
              />
              {errors.approach && (
                <p className="text-xs text-destructive">
                  {errors.approach.message}
                </p>
              )}
            </div>

            {/* Technologies */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-muted-foreground">
                <Cpu className="h-3.5 w-3.5" /> Technologies
                <span className="text-xs font-normal text-muted-foreground/60">
                  (comma-separated)
                </span>
              </Label>
              <Input
                {...register("technologies")}
                placeholder="React, Next.js, TypeScript, PostgreSQL"
                className="bg-white/5 border-white/10 focus:border-primary"
              />
            </div>

            {/* Deploy Target */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-muted-foreground">
                <Globe className="h-3.5 w-3.5" /> Deploy Target
              </Label>
              <Input
                {...register("deployTarget")}
                placeholder="Vercel, Railway, AWS, etc."
                className="bg-white/5 border-white/10 focus:border-primary"
              />
            </div>

            {/* Status + Priority + AssignedTo */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground">Status</Label>
                <Select
                  defaultValue="pending"
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
                  defaultValue="medium"
                  onValueChange={(v) => setValue("priority", v as TaskPriority)}
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

              <div className="space-y-1.5">
                <Label className="text-muted-foreground">Assign To</Label>
                <Input
                  {...register("assignedTo")}
                  placeholder="u1, u2…"
                  className="bg-white/5 border-white/10 focus:border-primary"
                />
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={saving}
                className="bg-linear-to-r from-primary to-violet-600 shadow-md shadow-primary/20 font-semibold"
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" strokeWidth={2.5} />
                )}
                {saving ? "Creating…" : "Create Task"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="border-border/50"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
