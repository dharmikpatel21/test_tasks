"use client";

import { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

const navItems = [
  { href: "/tasks", label: "All Tasks", icon: LayoutDashboard, exact: true },
  { href: "/tasks/new", label: "New Task", icon: Plus, exact: true },
];

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

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "relative flex flex-col border-r border-border bg-sidebar transition-all duration-250 ease-in-out flex-shrink-0",
          collapsed ? "w-16" : "w-60",
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-5 border-b border-sidebar-border overflow-hidden">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-600 shadow-md shadow-primary/30">
            <CheckSquare
              className="h-4 w-4 text-primary-foreground"
              strokeWidth={2.5}
            />
          </div>
          {!collapsed && (
            <span className="text-base font-bold tracking-tight text-foreground whitespace-nowrap">
              TaskFlow
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-2 pt-3">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact
              ? pathname === href
              : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all duration-150 overflow-hidden",
                  active
                    ? "bg-accent text-accent-foreground font-semibold border border-primary/20"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!collapsed && (
                  <span className="whitespace-nowrap">{label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-sidebar-border p-2 space-y-1">
          {user && (
            <div
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 overflow-hidden",
                collapsed && "justify-center",
              )}
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-primary to-violet-600 text-primary-foreground text-xs font-bold">
                  {user.avatar ?? user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground capitalize">
                    {user.role}
                  </p>
                </div>
              )}
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className={cn(
              "w-full text-destructive hover:bg-destructive/10 hover:text-destructive",
              collapsed ? "justify-center px-0" : "justify-start",
            )}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="absolute -right-3 top-5 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-sidebar text-muted-foreground shadow-sm hover:bg-accent transition-colors z-10"
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 min-w-0 overflow-auto">{children}</main>
    </div>
  );
}
