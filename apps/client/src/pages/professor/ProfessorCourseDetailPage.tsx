import { useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  FilterTabs,
  InfoPanel,
  StudentMoveRow,
  SwapRequestCard,
} from "../../components/shared";
import { LABELS } from "../../constants";
import { useGroups, useStudents, useSwapRequests } from "../../hooks";

export function ProfessorCourseDetailPage() {
  const location = useLocation();
  const params = useParams<{ id: string }>();
  const { data } = useSwapRequests();
  const {
    data: groups,
    loading: groupsLoading,
    error: groupsError,
  } = useGroups();
  const {
    data: students,
    loading: studentsLoading,
    error: studentsError,
  } = useStudents();
  const [selectedGroupByStudent, setSelectedGroupByStudent] = useState<
    Record<string, string>
  >({});

  const isGroupView = location.pathname.includes("/groups");

  const groupOptions = useMemo(
    () =>
      (groups ?? []).map((group) => ({
        label: group.name,
        value: group.id,
        description: `${group.currentCount}/${group.capacity}`,
      })),
    [groups],
  );

  const fallbackGroupLabel = groupOptions[0]?.label ?? "-";

  const requests = (data ?? []).filter(
    (request) => request.courseId === params.id,
  );

  if (isGroupView) {
    if (groupsLoading || studentsLoading) {
      return <p className="text-sm text-slate-500">{LABELS.common.loading}</p>;
    }

    if (groupsError || studentsError) {
      return (
        <p className="text-sm text-danger">{groupsError ?? studentsError}</p>
      );
    }

    return (
      <section className="grid gap-4">
        <InfoPanel
          content="Odaberite novu grupu po studentu i zatim spremite raspodjelu u backend kad endpoint bude dostupan."
          title="Ručna preraspodjela studenata"
          tone="info"
        />
        {(students ?? []).slice(0, 12).map((student) => (
          <StudentMoveRow
            currentGroupLabel={fallbackGroupLabel}
            groupOptions={groupOptions}
            key={student.id}
            onGroupChange={(value) =>
              setSelectedGroupByStudent((current) => ({
                ...current,
                [student.id]: value,
              }))
            }
            selectedGroupId={selectedGroupByStudent[student.id]}
            studentEmail={student.email}
            studentName={`${student.firstName} ${student.lastName}`}
          />
        ))}
      </section>
    );
  }

  return (
    <section className="grid gap-4">
      <FilterTabs
        activeValue="all"
        onChange={() => undefined}
        tabs={[{ label: LABELS.nav.requests, value: "all" }]}
      />
      {requests.map((request) => (
        <SwapRequestCard key={request.id} request={request} />
      ))}
    </section>
  );
}
