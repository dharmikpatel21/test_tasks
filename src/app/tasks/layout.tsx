"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  CheckSquare,
  LayoutDashboard,
  LogOut,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user ?? null))
      .catch(() => null);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Logged out");
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    { href: "/tasks", label: "All Tasks", icon: LayoutDashboard, exact: true },
    { href: "/tasks/new", label: "New Task", icon: Plus, exact: true },
  ];

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#0d0d1a",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* ── Sidebar ── */}
      <aside
        style={{
          width: collapsed ? 64 : 240,
          flexShrink: 0,
          background: "rgba(255,255,255,0.03)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.25s ease",
          overflow: "hidden",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "20px 16px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
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
              flexShrink: 0,
              boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
            }}
          >
            <CheckSquare size={18} color="white" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#f1f5f9",
                letterSpacing: "-0.3px",
                whiteSpace: "nowrap",
              }}
            >
              TaskFlow
            </span>
          )}
        </div>

        {/* Nav */}
        <nav
          style={{
            flex: 1,
            padding: "12px 8px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact
              ? pathname === href
              : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 10px",
                  borderRadius: 9,
                  textDecoration: "none",
                  background: active ? "rgba(99,102,241,0.18)" : "transparent",
                  color: active ? "#a5b4fc" : "#64748b",
                  fontWeight: active ? 600 : 400,
                  fontSize: 14,
                  transition: "background 0.15s, color 0.15s",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  border: active
                    ? "1px solid rgba(99,102,241,0.25)"
                    : "1px solid transparent",
                }}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                {!collapsed && label}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.07)",
            padding: "12px 8px",
          }}
        >
          {user && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                marginBottom: 6,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "white",
                  flexShrink: 0,
                }}
              >
                {user.avatar ?? user.name.slice(0, 2).toUpperCase()}
              </div>
              {!collapsed && (
                <div style={{ overflow: "hidden" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#cbd5e1",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {user.name}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      color: "#475569",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {user.role}
                  </p>
                </div>
              )}
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              padding: "9px 10px",
              border: "none",
              background: "transparent",
              borderRadius: 9,
              color: "#ef4444",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              transition: "background 0.15s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(239,68,68,0.1)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <LogOut size={17} style={{ flexShrink: 0 }} />
            {!collapsed && "Logout"}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          style={{
            position: "absolute",
            top: 20,
            right: -12,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "#1e1e3a",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#64748b",
            transition: "background 0.15s",
            zIndex: 10,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#2d2d50")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#1e1e3a")}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, overflow: "auto", minWidth: 0 }}>{children}</main>
    </div>
  );
}
