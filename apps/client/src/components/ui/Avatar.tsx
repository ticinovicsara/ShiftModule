import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-base",
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function Avatar({
  className,
  name,
  size = "md",
  src,
  ...props
}: AvatarProps) {
  return (
    <div
      aria-label={name}
      className={clsx(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/15 bg-primary/10 font-bold text-primary",
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {src ? (
        <img alt={name} className="size-full object-cover" src={src} />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}
