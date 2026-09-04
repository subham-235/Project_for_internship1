"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card } from "./Card";

type StatCardProps = {
  label: string;
  value: number;
  icon: LucideIcon;
  suffix?: string;
  hint?: string;
  tone?: "brand" | "accent" | "success" | "warning";
  className?: string;
};

const tones = {
  brand: "bg-blue-50 text-brand ring-blue-100",
  accent: "bg-indigo-50 text-accent ring-indigo-100",
  success: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  warning: "bg-amber-50 text-amber-600 ring-amber-100",
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  suffix = "",
  hint,
  tone = "brand",
  className,
}: StatCardProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => `${Math.round(latest).toLocaleString()}${suffix}`);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      count.set(value);
      return;
    }
    const controls = animate(count, value, { duration: 0.75, ease: [0.16, 1, 0.3, 1] });
    return controls.stop;
  }, [count, reduceMotion, value]);

  return (
    <Card className={cn("group p-5 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <motion.p className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-slate-950">
            {rounded}
          </motion.p>
          {hint ? <p className="mt-2 text-xs font-medium text-slate-400">{hint}</p> : null}
        </div>
        <div className={cn("grid size-11 place-items-center rounded-xl ring-1 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105", tones[tone])}>
          <Icon className="size-5" aria-hidden="true" />
        </div>
      </div>
    </Card>
  );
}
