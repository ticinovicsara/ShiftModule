import { SessionKind } from "@repo/types";
import { SESSION_TYPE_TABS } from "../../../constants";
import { Button, EmptyState, Input } from "../../ui";
import { StudentMoveRow } from "../StudentMoveRow";
import type { StudentWithSelectedAssignment } from "../../../types";

interface StudentsSectionProps {
  studentsSessionKind: SessionKind;
  setStudentsSessionKind: (kind: SessionKind) => void;
  studentSearch: string;
  setStudentSearch: (value: string) => void;
  studentsForSelectedKind: StudentWithSelectedAssignment[];
  studentGroupOptionsByStudentId: Map<
    string,
    Array<{ label: string; value: string; description?: string }>
  >;
  selectedGroupByStudent: Record<string, string>;
  movingStudentId: string | null;
  onGroupChange: (studentId: string, value: string) => void;
  onMoveStudent: (studentId: string, selectedGroupId: string) => Promise<void>;
}

export function StudentsSection({
  studentsSessionKind,
  setStudentsSessionKind,
  studentSearch,
  setStudentSearch,
  studentsForSelectedKind,
  studentGroupOptionsByStudentId,
  selectedGroupByStudent,
  movingStudentId,
  onGroupChange,
  onMoveStudent,
}: StudentsSectionProps) {
  return (
    <section className="grid gap-4">
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
        <div className="grid gap-3">
          {studentsForSelectedKind.map((student) => {
            const assignment = student.selectedAssignment;
            if (!assignment) {
              return null;
            }

            return (
              <StudentMoveRow
                key={student.id}
                currentGroupId={assignment.groupId}
                currentGroupLabel={assignment.groupName}
                groupOptions={
                  studentGroupOptionsByStudentId.get(student.id) ?? []
                }
                isMoving={movingStudentId === student.id}
                onGroupChange={(value) => onGroupChange(student.id, value)}
                onMove={(selectedGroupId) =>
                  onMoveStudent(student.id, selectedGroupId)
                }
                selectedGroupId={selectedGroupByStudent[student.id]}
                studentEmail={student.email}
                studentName={`${student.firstName} ${student.lastName}`}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
