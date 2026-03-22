import type { SelectOption } from "../ui";
import { Select, Button } from "../ui";

export interface StudentMoveRowProps {
  studentName: string;
  studentEmail: string;
  currentGroupId: string;
  currentGroupLabel: string;
  selectedGroupId?: string;
  groupOptions: SelectOption[];
  onGroupChange: (value: string) => void;
  onMove?: (selectedGroupId: string) => Promise<void>;
  isMoving?: boolean;
}

export function StudentMoveRow({
  currentGroupId,
  currentGroupLabel,
  groupOptions,
  onGroupChange,
  onMove,
  isMoving,
  selectedGroupId,
  studentEmail,
  studentName,
}: StudentMoveRowProps) {
  const effectiveSelectedGroupId = selectedGroupId ?? currentGroupId;
  const hasChanged = effectiveSelectedGroupId !== currentGroupId;

  return (
    <article className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft md:grid-cols-[1.4fr_1fr_auto] md:items-end">
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
        placeholder="Odaberi novu grupu"
        value={effectiveSelectedGroupId}
      />
      {hasChanged && onMove && (
        <Button
          onClick={() => onMove(effectiveSelectedGroupId)}
          disabled={isMoving}
          size="sm"
          variant="success"
        >
          {isMoving ? "Premještam..." : "Premjesti"}
        </Button>
      )}
    </article>
  );
}
