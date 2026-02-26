"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn, CheckSquare } from "lucide-react";

type FormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  return (
    <div className="login-root">
      {/* Background blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="login-card">
        {/* Logo / Brand */}
        <div className="login-brand">
          <div className="login-logo">
            <CheckSquare size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="login-title">TaskFlow</h1>
            <p className="login-subtitle">Project Task Manager</p>
          </div>
        </div>

        <div className="login-divider" />

        <p className="login-heading">Sign in to your account</p>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          {/* Email */}
          <div className="field-group">
            <label className="field-label">Email address</label>
            <input
              type="email"
              autoComplete="email"
              placeholder="admin@test.com"
              className={`field-input ${errors.email ? "field-input--error" : ""}`}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
            />
            {errors.email && (
              <p className="field-error">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="field-group">
            <label className="field-label">Password</label>
            <div className="field-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                className={`field-input field-input--password ${errors.password ? "field-input--error" : ""}`}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="field-eye-btn"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="field-error">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button type="submit" disabled={isLoading} className="login-btn">
            {isLoading ? (
              <span className="login-btn-spinner" />
            ) : (
              <LogIn size={17} strokeWidth={2.5} />
            )}
            {isLoading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="login-hint">
          Demo: <span>admin@test.com</span> / <span>password</span>
        </p>
      </div>

      <style>{`
        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0a14;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', system-ui, sans-serif;
        }

        /* Animated gradient blobs */
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.25;
          animation: blobFloat 8s ease-in-out infinite alternate;
        }
        .blob-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #6366f1, #8b5cf6);
          top: -150px; left: -150px;
          animation-delay: 0s;
        }
        .blob-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #3b82f6, #06b6d4);
          bottom: -120px; right: -100px;
          animation-delay: 3s;
        }
        .blob-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, #ec4899, #f43f5e);
          top: 50%; left: 60%;
          animation-delay: 6s;
        }
        @keyframes blobFloat {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(30px, 30px) scale(1.05); }
        }

        /* Card */
        .login-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 420px;
          margin: 16px;
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 40px 36px;
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.05),
            0 32px 80px rgba(0, 0, 0, 0.6),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        /* Brand */
        .login-brand {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 24px;
        }
        .login-logo {
          width: 48px; height: 48px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
        }
        .login-title {
          font-size: 22px;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .login-subtitle {
          font-size: 12px;
          color: #64748b;
          margin: 0;
          margin-top: 2px;
        }

        .login-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          margin-bottom: 24px;
        }

        .login-heading {
          font-size: 15px;
          font-weight: 500;
          color: #94a3b8;
          margin: 0 0 24px;
        }

        /* Form */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .field-label {
          font-size: 13px;
          font-weight: 500;
          color: #cbd5e1;
        }
        .field-input {
          width: 100%;
          box-sizing: border-box;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 14px;
          color: #f1f5f9;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .field-input::placeholder { color: #475569; }
        .field-input:focus {
          border-color: #6366f1;
          background: rgba(99, 102, 241, 0.08);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }
        .field-input--error {
          border-color: #f43f5e !important;
          box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.15) !important;
        }
        .field-input--password { padding-right: 44px; }
        .field-password-wrapper { position: relative; }
        .field-eye-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          cursor: pointer;
          color: #64748b;
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 0.2s;
        }
        .field-eye-btn:hover { color: #94a3b8; }
        .field-error {
          font-size: 12px;
          color: #f43f5e;
          margin: 0;
        }

        /* Button */
        .login-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 10px;
          color: white;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 4px;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.35);
        }
        .login-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(99, 102, 241, 0.45);
        }
        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .login-btn-spinner {
          width: 17px; height: 17px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Hint */
        .login-hint {
          margin-top: 20px;
          font-size: 12px;
          color: #475569;
          text-align: center;
        }
        .login-hint span {
          color: #6366f1;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
