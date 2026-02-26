"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn, CheckSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type FormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error ?? "Login failed");
        return;
      }
      toast.success(`Welcome back, ${result.user.name}!`);
      router.push("/tasks");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      {/* Gradient blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-violet-600/15 blur-[100px] animate-pulse [animation-delay:2s]" />

      <Card className="relative z-10 w-full max-w-[420px] mx-4 border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-2xl">
        <CardHeader className="pb-4 space-y-0">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-600 shadow-lg shadow-primary/30">
              <CheckSquare
                className="h-5 w-5 text-primary-foreground"
                strokeWidth={2.5}
              />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                TaskFlow
              </h1>
              <p className="text-xs text-muted-foreground">
                Project Task Manager
              </p>
            </div>
          </div>
          <Separator className="bg-white/8" />
          <p className="pt-5 text-sm text-muted-foreground">
            Sign in to your account
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-300">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@test.com"
                className={`bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-primary/20 ${errors.email ? "border-destructive focus:border-destructive" : ""}`}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email",
                  },
                })}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-300">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground/50 pr-10 focus:border-primary focus:ring-primary/20 ${errors.password ? "border-destructive" : ""}`}
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Minimum 6 characters" },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPw ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 shadow-lg shadow-primary/25 font-semibold transition-all hover:-translate-y-0.5"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" strokeWidth={2.5} />
              )}
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Demo:{" "}
            <span className="text-primary font-medium">admin@test.com</span>
            {" / "}
            <span className="text-primary font-medium">password</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
