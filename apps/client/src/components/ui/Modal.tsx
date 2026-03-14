import { clsx } from "clsx";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  variant?: "center" | "bottom-sheet";
}

export function Modal({
  children,
  description,
  footer,
  onClose,
  open,
  title,
  variant = "center",
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!mounted || !open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-4 backdrop-blur-sm md:items-center">
      <button
        aria-label="Close modal"
        className="absolute inset-0"
        onClick={onClose}
        type="button"
      />
      <div
        className={clsx(
          "relative w-full overflow-hidden border border-white/60 bg-white shadow-panel",
          variant === "center" && "max-w-xl rounded-2xl",
          variant === "bottom-sheet" &&
            "max-w-2xl rounded-t-2xl md:rounded-2xl",
        )}
      >
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="mb-3 flex justify-center md:hidden">
            {variant === "bottom-sheet" ? (
              <span className="h-1.5 w-12 rounded-full bg-slate-200" />
            ) : null}
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{title}</h2>
              {description ? (
                <p className="mt-1 text-sm text-slate-500">{description}</p>
              ) : null}
            </div>
            <button
              className="text-slate-400 transition-colors hover:text-slate-700"
              onClick={onClose}
              type="button"
            >
              ×
            </button>
          </div>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-5">{children}</div>
        {footer ? (
          <div className="border-t border-slate-100 px-5 py-4">{footer}</div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
