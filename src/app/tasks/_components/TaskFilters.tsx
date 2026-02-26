"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import type { TaskStatus } from "@/lib/api";

const tabLabels: Record<string, string> = {
  all: "All",
  pending: "Pending",
  processing: "Processing",
  complete: "Complete",
};

interface Props {
  counts: Record<string, number>;
  activeFilter: string;
  activeSearch: string;
}

export function TaskFilters({ counts, activeFilter, activeSearch }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function navigate(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, val] of Object.entries(updates)) {
      if (val === null || val === "" || val === "all") params.delete(key);
      else params.set(key, val);
    }
    // always reset to page 1 when filter/search changes
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  function onSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      navigate({ q: e.target.value });
    }, 350);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Status tabs */}
      <Tabs
        value={activeFilter}
        onValueChange={(v) => navigate({ status: v as TaskStatus | "all" })}
      >
        <TabsList className="bg-card/60 border border-border/50">
          {(["all", "pending", "processing", "complete"] as const).map((s) => (
            <TabsTrigger
              key={s}
              value={s}
              className="text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              {tabLabels[s]}
              {counts[s] != null && (
                <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {counts[s]}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="relative flex-1 min-w-[180px]">
        {isPending ? (
          <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground animate-spin" />
        ) : (
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        )}
        <Input
          ref={searchRef}
          defaultValue={activeSearch}
          onChange={onSearchChange}
          placeholder="Search tasks…"
          className="pl-9 bg-card/60 border-border/50 text-sm h-9"
        />
      </div>
    </div>
  );
}
