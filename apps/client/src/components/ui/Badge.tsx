import { clsx } from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "neutral"
    | "primary"
    | "pending"
    | "approved"
    | "rejected"
    | "auto"
    | "full"
    | "warning";
  size?: "sm" | "md";
  leadingIcon?: ReactNode;
}

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  neutral: "bg-slate-100 text-slate-600",
  primary: "bg-primary/10 text-primary border border-primary/15",
  pending: "bg-amber-100 text-amber-700 border border-amber-200",
  approved: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  rejected: "bg-red-100 text-red-700 border border-red-200",
  auto: "bg-primary text-white",
  full: "bg-red-500 text-white",
  warning: "bg-yellow-100 text-yellow-700 border border-yellow-200",
};

const sizeClasses: Record<NonNullable<BadgeProps["size"]>, string> = {
  sm: "px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em]",
  md: "px-2.5 py-1 text-xs font-semibold",
};

export function Badge({
  children,
  className,
  leadingIcon,
  size = "md",
  variant = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {leadingIcon}
      {children}
    </span>
  );
}
