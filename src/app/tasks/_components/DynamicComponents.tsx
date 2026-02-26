"use client";

// This client-boundary file owns the `ssr: false` dynamic imports.
// `ssr: false` is NOT allowed in Server Components, so it must live here.
import dynamic from "next/dynamic";

export const TaskFilters = dynamic(
  () => import("./TaskFilters").then((m) => m.TaskFilters),
  { ssr: false },
);

export const TaskPagination = dynamic(
  () => import("./TaskPagination").then((m) => m.TaskPagination),
  { ssr: false },
);
