import { clsx } from "clsx";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
  description?: string;
}

export interface SelectProps {
  className?: string;
  label?: string;
  hint?: string;
  error?: string | null;
  leadingIcon?: ReactNode;
  options: SelectOption[];
  placeholder?: string;
  value?: string;
  name?: string;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
}

export function Select({
  className,
  disabled = false,
  error,
  hint,
  label,
  leadingIcon,
  name,
  onValueChange,
  options,
  placeholder,
  value,
}: SelectProps) {
  const helperText = error ?? hint;
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLLabelElement | null>(null);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleDocumentClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen((current) => !current);
    }
  };

  const currentLabel = selectedOption?.label ?? placeholder ?? "Select option";

  const selectOption = (nextValue: string) => {
    onValueChange?.(nextValue);
    setOpen(false);
  };

  return (
    <label className="flex w-full flex-col gap-2" ref={containerRef}>
      {label ? (
        <span className="text-sm font-medium text-slate-700">{label}</span>
      ) : null}

      <input name={name} type="hidden" value={value ?? ""} />

      <div
        className={clsx(
          "relative rounded-xl border bg-white shadow-sm transition-colors focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15",
          error ? "border-danger/40" : "border-slate-200",
          disabled && "opacity-60",
        )}
      >
        <button
          aria-expanded={open}
          className={clsx(
            "flex h-11 w-full items-center justify-between gap-3 px-3 text-left text-sm focus:outline-none",
            className,
          )}
          disabled={disabled}
          onClick={() => setOpen((current) => !current)}
          onKeyDown={handleKeyDown}
          type="button"
        >
          <span className="flex min-w-0 items-center gap-2">
            {leadingIcon ? (
              <span className="text-slate-400">{leadingIcon}</span>
            ) : null}
            <span
              className={clsx(
                "truncate",
                selectedOption ? "text-slate-900" : "text-slate-400",
              )}
            >
              {currentLabel}
            </span>
          </span>
          <span
            className={clsx(
              "text-slate-400 transition-transform",
              open && "rotate-180",
            )}
          >
            ▾
          </span>
        </button>

        <div
          className={clsx(
            "absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-panel transition-all",
            open
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-1 opacity-0",
          )}
        >
          <div className="max-h-64 overflow-y-auto p-1.5">
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  className={clsx(
                    "flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                    option.disabled
                      ? "cursor-not-allowed bg-slate-50 text-slate-400"
                      : "text-slate-700 hover:bg-primary/8 hover:text-slate-900",
                    isSelected &&
                      !option.disabled &&
                      "bg-primary/10 text-primary",
                  )}
                  disabled={option.disabled}
                  key={option.value}
                  onClick={() => selectOption(option.value)}
                  type="button"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">
                      {option.label}
                    </span>
                    {option.description ? (
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {option.description}
                      </span>
                    ) : null}
                  </span>
                  {isSelected ? (
                    <span className="text-sm font-bold">✓</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

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
