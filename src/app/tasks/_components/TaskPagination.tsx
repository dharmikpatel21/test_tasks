"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface Props {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
}

export function TaskPagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  if (totalPages <= 1) return null;

  function goTo(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  const pageStart = (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="flex items-center justify-between pt-2">
      <p className="text-xs text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground">
          {pageStart}–{pageEnd}
        </span>{" "}
        of <span className="font-medium text-foreground">{totalCount}</span>{" "}
        tasks
      </p>

      <Pagination>
        <PaginationContent className="gap-1">
          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goTo(currentPage - 1)}
              disabled={currentPage <= 1}
              className="h-8 gap-1.5 border-border/50 text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </Button>
          </PaginationItem>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <PaginationItem key={p}>
              <Button
                variant={currentPage === p ? "default" : "ghost"}
                size="sm"
                onClick={() => goTo(p)}
                className={cn(
                  "h-8 w-8 p-0 text-xs",
                  currentPage === p
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {p}
              </Button>
            </PaginationItem>
          ))}

          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goTo(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="h-8 gap-1.5 border-border/50 text-xs"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
