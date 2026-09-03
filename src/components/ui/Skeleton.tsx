import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export default function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-xl bg-slate-200/75 before:absolute before:inset-0 before:-translate-x-full before:animate-[skeleton-shimmer_1.7s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent motion-reduce:before:animate-none",
        className,
      )}
      {...props}
    />
  );
}
