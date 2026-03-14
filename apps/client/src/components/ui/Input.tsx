import { clsx } from "clsx";
import type { InputHTMLAttributes, ReactNode } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string | null;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export function Input({
  className,
  error,
  hint,
  id,
  label,
  leadingIcon,
  trailingIcon,
  ...props
}: InputProps) {
  const helperText = error ?? hint;

  return (
    <label className="flex w-full flex-col gap-2">
      {label ? (
        <span className="text-sm font-medium text-slate-700">{label}</span>
      ) : null}
      <span
        className={clsx(
          "flex items-center rounded-xl border bg-white px-3 shadow-sm transition-colors focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15",
          error ? "border-danger/40" : "border-slate-200",
        )}
      >
        {leadingIcon ? (
          <span className="mr-2 text-slate-400">{leadingIcon}</span>
        ) : null}
        <input
          className={clsx(
            "h-11 w-full border-0 bg-transparent p-0 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none",
            className,
          )}
          id={id}
          {...props}
        />
        {trailingIcon ? (
          <span className="ml-2 text-slate-400">{trailingIcon}</span>
        ) : null}
      </span>
      {helperText ? (
        <span
          className={clsx("text-xs", error ? "text-danger" : "text-slate-500")}
        >
          {helperText}
        </span>
      ) : null}
    </label>
  );
}
