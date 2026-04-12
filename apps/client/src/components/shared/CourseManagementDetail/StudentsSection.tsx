import { SessionKind } from "@repo/types";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { SESSION_TYPE_TABS } from "../../../constants";
import { Button, EmptyState, Input, Select } from "../../ui";
import { StudentMoveRow } from "../StudentMoveRow";
import type {
  CourseGroup,
  StudentWithSelectedAssignment,
} from "../../../types";

interface AdminStudentControls {
  selectedStudentId: string;
  setSelectedStudentId: (value: string) => void;
  studentOptions: Array<{ label: string; value: string; description?: string }>;
  onEnrollWithoutGroup: () => Promise<void>;
  enrolling: boolean;
  importJson: string;
  setImportJson: (value: string) => void;
  onImportStudents: () => Promise<void>;
  importing: boolean;
}

interface AutoAssignControls {
  onAutoAssign: () => Promise<void>;
  autoAssigning: boolean;
}

interface StudentsSectionProps {
  studentsSessionKind: SessionKind;
  setStudentsSessionKind: (kind: SessionKind) => void;
  studentSearch: string;
  setStudentSearch: (value: string) => void;
  studentsForSelectedKind: StudentWithSelectedAssignment[];
  groupsForSelectedKind: CourseGroup[];
  studentGroupOptionsByStudentId: Map<
    string,
    Array<{ label: string; value: string; description?: string }>
  >;
  selectedGroupByStudent: Record<string, string>;
  movingStudentId: string | null;
  onGroupChange: (studentId: string, value: string) => void;
  onMoveStudent: (studentId: string, selectedGroupId: string) => Promise<void>;
  adminControls?: AdminStudentControls;
  autoAssignControls?: AutoAssignControls;
}

export function StudentsSection({
  studentsSessionKind,
  setStudentsSessionKind,
  studentSearch,
  setStudentSearch,
  studentsForSelectedKind,
  groupsForSelectedKind,
  studentGroupOptionsByStudentId,
  selectedGroupByStudent,
  movingStudentId,
  onGroupChange,
  onMoveStudent,
  adminControls,
  autoAssignControls,
}: StudentsSectionProps) {
  const { ungroupedStudents, groupedByGroupId } = useMemo(() => {
    const ungrouped: StudentWithSelectedAssignment[] = [];
    const grouped = new Map<string, StudentWithSelectedAssignment[]>();

    for (const student of studentsForSelectedKind) {
      const assignment = student.selectedAssignment;
      const groupId = assignment?.groupId?.trim();

      if (!groupId) {
        ungrouped.push(student);
        continue;
      }

      const existing = grouped.get(groupId) ?? [];
      existing.push(student);
      grouped.set(groupId, existing);
    }

    return { ungroupedStudents: ungrouped, groupedByGroupId: grouped };
  }, [studentsForSelectedKind]);

  const ungroupedCount = ungroupedStudents.length;

  const handleAutoAssignClick = () => {
    if (!autoAssignControls) {
      return;
    }

    if (ungroupedCount === 0) {
      toast.error("Nema studenata bez grupe.");
      return;
    }

    void autoAssignControls.onAutoAssign();
  };

  const renderStudentRow = (student: StudentWithSelectedAssignment) => {
    const assignment = student.selectedAssignment;
    return (
      <StudentMoveRow
        key={student.id}
        currentGroupId={assignment?.groupId ?? ""}
        currentGroupLabel={assignment?.groupName ?? "Bez grupe"}
        groupOptions={studentGroupOptionsByStudentId.get(student.id) ?? []}
        isMoving={movingStudentId === student.id}
        onGroupChange={(value) => onGroupChange(student.id, value)}
        onMove={(selectedGroupId) => onMoveStudent(student.id, selectedGroupId)}
        selectedGroupId={selectedGroupByStudent[student.id]}
        studentEmail={student.email}
        studentName={`${student.firstName} ${student.lastName}`}
      />
    );
  };

  const fallbackGroups = Array.from(groupedByGroupId.keys())
    .filter(
      (groupId) => !groupsForSelectedKind.some((group) => group.id === groupId),
    )
    .map((groupId) => ({
      id: groupId,
      name:
        groupedByGroupId.get(groupId)?.[0]?.selectedAssignment?.groupName ??
        groupId,
      capacity: 0,
      currentCount: groupedByGroupId.get(groupId)?.length ?? 0,
    }));

  const cards = [
    ...groupsForSelectedKind.map((group) => ({
      id: group.id,
      name: group.name,
      capacity: group.capacity,
      currentCount: group.currentCount,
      students: groupedByGroupId.get(group.id) ?? [],
    })),
    ...fallbackGroups.map((group) => ({
      ...group,
      students: groupedByGroupId.get(group.id) ?? [],
    })),
  ];

  return (
    <section className="grid gap-4">
      {adminControls ? (
        <article className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <h3 className="text-sm font-semibold text-slate-900">
            Admin upis studenata
          </h3>

          <div className="grid gap-3 md:grid-cols-[1.4fr_auto] md:items-end">
            <Select
              label="Postojeći student"
              options={adminControls.studentOptions}
              placeholder="Odaberi studenta"
              value={adminControls.selectedStudentId}
              onValueChange={adminControls.setSelectedStudentId}
            />
            <Button
              size="sm"
              variant="success"
              disabled={
                !adminControls.selectedStudentId || adminControls.enrolling
              }
              onClick={() => void adminControls.onEnrollWithoutGroup()}
            >
              {adminControls.enrolling ? "Upisujem..." : "Upiši bez grupe"}
            </Button>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">
              JSON import (lokalni studenti)
            </span>
            <textarea
              className="min-h-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              placeholder='[{"korisnikoime":"student1@fesb.hr"}] ili [[{...}]]'
              value={adminControls.importJson}
              onChange={(event) =>
                adminControls.setImportJson(event.target.value)
              }
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="success"
              disabled={
                !adminControls.importJson.trim() || adminControls.importing
              }
              onClick={() => void adminControls.onImportStudents()}
            >
              {adminControls.importing ? "Uvozim..." : "Uvezi studente"}
            </Button>
          </div>
        </article>
      ) : null}

      <div className="grid gap-2">
        <p className="text-sm font-semibold text-slate-900">Tip vježbe</p>
        <div className="flex flex-wrap gap-2">
          {SESSION_TYPE_TABS.map((tab) => (
            <Button
              key={tab.value}
              size="sm"
              variant={
                studentsSessionKind === tab.value ? "primary" : "outline"
              }
              onClick={() => setStudentsSessionKind(tab.value)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      <Input
        label="Pretraži studente"
        placeholder="Unesite ime ili e-mail"
        value={studentSearch}
        onChange={(event) => setStudentSearch(event.target.value)}
        type="text"
      />

      {!studentsForSelectedKind.length ? (
        <EmptyState
          title="Nema studenata"
          description="Nema studenata za odabrani tip vježbi i pretragu."
        />
      ) : (
        <div className="grid gap-4">
          {ungroupedCount > 0 ? (
            <article className="flex h-full flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-amber-900">
                  Bez grupe ({ungroupedCount})
                </h3>
                {autoAssignControls ? (
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={autoAssignControls.autoAssigning}
                    onClick={handleAutoAssignClick}
                  >
                    {autoAssignControls.autoAssigning
                      ? "Raspoređujem..."
                      : "Automatski rasporedi bez grupe"}
                  </Button>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col gap-3">
                {ungroupedStudents.map(renderStudentRow)}
              </div>
            </article>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 md:auto-rows-fr">
            {cards.map((card) => (
              <article
                key={card.id}
                className="flex h-full flex-col  gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft"
              >
                <h3 className="text-sm font-semibold text-slate-900">
                  {card.name} - {card.currentCount}/{card.capacity}
                </h3>

                {card.students.length ? (
                  <div className="flex flex-1 flex-col gap-3">
                    {card.students.map(renderStudentRow)}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    Nema studenata u ovoj grupi.
                  </p>
                )}
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
