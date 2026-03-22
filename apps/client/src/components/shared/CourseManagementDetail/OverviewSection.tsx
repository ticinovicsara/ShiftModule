import { SessionKind } from "@repo/types";
import { CapacityBar } from "../CapacityBar";
import { MetricCard } from "../MetricCard";
import type { CourseDetailPayload, CourseGroup } from "../../../types";

interface CapacitySummaryCardProps {
  title: string;
  groups: CourseGroup[];
  kind: SessionKind;
  totalStudentsForKind: (kind: SessionKind) => number;
}

function CapacitySummaryCard({
  title,
  groups,
  kind,
  totalStudentsForKind,
}: CapacitySummaryCardProps) {
  return (
    <article className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {!groups.length ? (
        <p className="text-sm text-slate-500">Nema grupa ovog tipa.</p>
      ) : (
        groups.map((group) => (
          <div className="grid gap-2" key={group.id}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">{group.name}</p>
              <p className="text-xs text-slate-500">
                {group.currentCount}/{group.capacity}
              </p>
            </div>
            <CapacityBar current={group.currentCount} max={group.capacity} />
          </div>
        ))
      )}
      <div className="flex justify-end border-t border-slate-100 pt-2">
        <p className="text-xs font-semibold text-slate-600">
          Ukupno: {totalStudentsForKind(kind)} studenata
        </p>
      </div>
    </article>
  );
}

interface OverviewSectionProps {
  detail: CourseDetailPayload;
  labGroups: CourseGroup[];
  exerciseGroups: CourseGroup[];
  totalStudentsForKind: (kind: SessionKind) => number;
}

export function OverviewSection({
  detail,
  labGroups,
  exerciseGroups,
  totalStudentsForKind,
}: OverviewSectionProps) {
  return (
    <section className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Ukupno studenata"
          value={String(detail.stats.totalStudents)}
        />
        <MetricCard
          title="Broj grupa"
          value={String(detail.stats.groupsCount)}
        />
        <MetricCard
          title="Zahtjevi na čekanju"
          value={String(detail.stats.pendingSwapRequests)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CapacitySummaryCard
          title="Laboratorijske vježbe"
          groups={labGroups}
          kind={SessionKind.LAB}
          totalStudentsForKind={totalStudentsForKind}
        />
        <CapacitySummaryCard
          title="Auditorne vježbe"
          groups={exerciseGroups}
          kind={SessionKind.EXERCISE}
          totalStudentsForKind={totalStudentsForKind}
        />
      </div>
    </section>
  );
}
