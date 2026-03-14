import { clsx } from "clsx";

export interface FilterTab {
  label: string;
  value: string;
}

export interface FilterTabsProps {
  tabs: FilterTab[];
  activeValue: string;
  onChange: (value: string) => void;
}

export function FilterTabs({ tabs, activeValue, onChange }: FilterTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          className={clsx(
            "rounded-full px-3 py-2 text-sm font-medium",
            activeValue === tab.value
              ? "bg-primary text-white"
              : "bg-white text-slate-600 hover:bg-slate-100",
          )}
          key={tab.value}
          onClick={() => onChange(tab.value)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
