import { clsx } from "clsx";

export interface SwapProgressProps {
  currentStep: 1 | 2;
}

export function SwapProgress({ currentStep }: SwapProgressProps) {
  const steps: Array<1 | 2> = [1, 2];

  return (
    <div className="grid grid-cols-2 gap-2">
      {steps.map((step) => (
        <div
          className={clsx(
            "rounded-xl px-3 py-2 text-center text-sm font-semibold",
            step <= currentStep
              ? "bg-primary text-white"
              : "bg-white text-slate-500",
          )}
          key={step}
        >
          Korak {step}
        </div>
      ))}
    </div>
  );
}
