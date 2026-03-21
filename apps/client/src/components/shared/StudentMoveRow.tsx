import type { SelectOption } from "../ui";
import { Select } from "../ui";

export interface StudentMoveRowProps {
  studentName: string;
  studentEmail: string;
  currentGroupLabel: string;
  selectedGroupId?: string;
  groupOptions: SelectOption[];
  onGroupChange: (value: string) => void;
}

export function StudentMoveRow({
  currentGroupLabel,
  groupOptions,
  onGroupChange,
  selectedGroupId,
  studentEmail,
  studentName,
}: StudentMoveRowProps) {
  return (
    <article className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft md:grid-cols-[1.4fr_1fr] md:items-end">
      <div className="grid gap-1">
        <p className="text-sm font-semibold text-slate-900">{studentName}</p>
        <p className="text-xs text-slate-500">{studentEmail}</p>
        <p className="text-xs font-medium text-slate-600">
          Trenutna grupa:{" "}
          <span className="text-slate-900">{currentGroupLabel}</span>
        </p>
      </div>
      <Select
        label="Premjesti u grupu"
        onValueChange={onGroupChange}
        options={groupOptions}
        value={selectedGroupId}
      />
    </article>
  );
}
