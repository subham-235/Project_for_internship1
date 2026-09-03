import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "brand-shimmer bg-brand text-white shadow-[0_10px_25px_-12px_rgba(37,99,235,.8)] hover:-translate-y-0.5 hover:bg-brand-deep hover:shadow-[0_16px_34px_-14px_rgba(37,99,235,.65)]",
  secondary:
    "bg-accent text-white shadow-[0_10px_25px_-12px_rgba(99,102,241,.7)] hover:-translate-y-0.5 hover:bg-indigo-700",
  outline:
    "border border-slate-200 bg-white/80 text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-brand/40 hover:bg-blue-50 hover:text-brand-deep",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
  danger: "bg-rose-600 text-white shadow-sm hover:-translate-y-0.5 hover:bg-rose-700",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 rounded-xl px-3.5 text-sm",
  md: "h-11 rounded-xl px-5 text-sm",
  lg: "h-12 rounded-2xl px-6 text-[15px]",
  icon: "size-11 rounded-xl",
};

export default function Button({
  asChild = false,
  variant = "primary",
  size = "md",
  className,
  type,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : "button";

  return (
    <Component
      type={asChild ? undefined : type ?? "button"}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-bold transition-[transform,background-color,border-color,color,box-shadow] duration-300 ease-out active:scale-95 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
