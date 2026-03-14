import { clsx } from "clsx";

export interface CapacityBarProps {
  current: number;
  max: number;
}

const widthByBucket = {
  0: "w-0",
  1: "w-1/12",
  2: "w-2/12",
  3: "w-3/12",
  4: "w-4/12",
  5: "w-5/12",
  6: "w-6/12",
  7: "w-7/12",
  8: "w-8/12",
  9: "w-9/12",
  10: "w-10/12",
  11: "w-11/12",
  12: "w-full",
} as const;

function getSeverityClass(ratio: number) {
  if (ratio >= 1) {
    return "bg-danger";
  }

  if (ratio >= 0.85) {
    return "bg-amber-500";
  }

  return "bg-success";
}

function getWidthClass(ratio: number) {
  const bounded = Math.min(Math.max(ratio, 0), 1);
  const bucket = Math.round(bounded * 12) as keyof typeof widthByBucket;
  return widthByBucket[bucket];
}

export function CapacityBar({ current, max }: CapacityBarProps) {
  const safeMax = max > 0 ? max : 1;
  const ratio = current / safeMax;
  const percentage = Math.round(Math.min(Math.max(ratio, 0), 1) * 100);

  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={clsx(
            "h-full rounded-full transition-all",
            getSeverityClass(ratio),
            getWidthClass(ratio),
          )}
        />
      </div>
      <p className="text-xs text-slate-500">
        {current} / {max} ({percentage}%)
      </p>
    </div>
  );
}
