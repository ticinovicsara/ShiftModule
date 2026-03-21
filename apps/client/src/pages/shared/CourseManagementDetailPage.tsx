import { ReportIssueReason, SwapRequestStatus } from "@repo/types";
import { useCallback, useMemo, useState } from "react";
import { adminApi, professorApi } from "../../api";
import {
  CapacityBar,
  FilterTabs,
  MetricCard,
  StudentMoveRow,
  SwapRequestCard,
} from "../../components/shared";
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Input,
  Spinner,
} from "../../components/ui";
import { LABELS } from "../../constants";
import { useFetch, useGroups, useSwapRequests } from "../../hooks";

interface CourseStudent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  currentGroupId?: string;
  currentGroupName?: string;
}

interface CourseGroup {
  id: string;
  name: string;
  capacity: number;
  currentCount: number;
  isActive: boolean;
  sessionTypeId: string;
}

interface CourseDetailPayload {
  course: {
    id: string;
    title: string;
  };
  groups: CourseGroup[];
  students: CourseStudent[];
  stats: {
    totalStudents: number;
    groupsCount: number;
    pendingSwapRequests: number;
  };
}

const courseTabs = [
  { label: "Overview", value: "overview" },
  { label: "Students", value: "students" },
  { label: "Swap Requests", value: "requests" },
  { label: "Groups / Capacity", value: "groups" },
];

const requestTabs = [
  { label: "All", value: "all" },
  { label: "Pending manual", value: "manual" },
  { label: "Automatic", value: "automatic" },
];

interface CourseManagementDetailPageProps {
  courseId: string;
  role: "admin" | "professor";
}

export function CourseManagementDetailPage({
  courseId,
  role,
}: CourseManagementDetailPageProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [activeRequestTab, setActiveRequestTab] = useState("all");
  const [actionId, setActionId] = useState<string | null>(null);
  const [capacityDrafts, setCapacityDrafts] = useState<Record<string, number>>(
    {},
  );
  const [issueDrafts, setIssueDrafts] = useState<Record<string, string>>({});
  const [reportedGroupIds, setReportedGroupIds] = useState<
    Record<string, boolean>
  >({});
  const [selectedGroupByStudent, setSelectedGroupByStudent] = useState<
    Record<string, string>
  >({});
  const [studentSearch, setStudentSearch] = useState<string>("");
  const [movingStudentId, setMovingStudentId] = useState<string | null>(null);

  const fetchCourseDetail = useCallback(
    () =>
      role === "admin"
        ? adminApi.courses.getById(courseId)
        : professorApi.courses.getById(courseId),
    [courseId, role],
  );

  const {
    data: detail,
    loading: detailLoading,
    error: detailError,
    refetch: refetchDetail,
  } = useFetch<CourseDetailPayload>(fetchCourseDetail, [courseId, role]);

  const {
    data: requests,
    approve,
    reject,
    refetch: refetchRequests,
  } = useSwapRequests();
  const { updateCapacity, reportIssue } = useGroups();

  const courseRequests = useMemo(
    () =>
      (requests ?? []).filter((request) => {
        if (request.courseId !== courseId) return false;
        if (activeRequestTab === "manual")
          return request.status === SwapRequestStatus.PENDING;
        if (activeRequestTab === "automatic")
          return request.status === SwapRequestStatus.AUTO_RESOLVED;
        return true;
      }),
    [requests, courseId, activeRequestTab],
  );

  const groups = detail?.groups ?? [];
  const students = detail?.students ?? [];

  const studentsByGroup = useMemo(() => {
    const grouped = new Map<string, CourseStudent[]>();
    groups.forEach((group) => grouped.set(group.id, []));

    const filteredStudents = students.filter((student) => {
      if (!studentSearch.trim()) return true;
      const searchLower = studentSearch.toLowerCase();
      const name = `${student.firstName} ${student.lastName}`.toLowerCase();
      const email = student.email.toLowerCase();
      return name.includes(searchLower) || email.includes(searchLower);
    });

    filteredStudents.forEach((student) => {
      if (student.currentGroupId && grouped.has(student.currentGroupId)) {
        grouped.get(student.currentGroupId)?.push(student);
      } else {
        const existing = grouped.get("unassigned") ?? [];
        grouped.set("unassigned", [...existing, student]);
      }
    });
    return grouped;
  }, [groups, students, studentSearch]);

  const groupOptions = useMemo(
    () =>
      groups.map((group) => ({
        label: group.name,
        value: group.id,
        description: `${group.currentCount}/${group.capacity}`,
      })),
    [groups],
  );

  const handleApprove = async (requestId: string) => {
    setActionId(requestId);
    try {
      await approve(requestId);
      await refetchRequests();
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setActionId(requestId);
    try {
      await reject({ id: requestId, dto: { reason: "Odbijeno" } });
      await refetchRequests();
    } finally {
      setActionId(null);
    }
  };

  const saveCapacity = async (group: CourseGroup) => {
    const nextCapacity = capacityDrafts[group.id] ?? group.capacity;
    await updateCapacity({ id: group.id, dto: { capacity: nextCapacity } });
    await refetchDetail();
  };

  const sendIssueReport = async (groupId: string) => {
    const description = (issueDrafts[groupId] ?? "").trim();
    await reportIssue({
      id: groupId,
      dto: { reason: ReportIssueReason.OTHER, description },
    });
    setReportedGroupIds((current) => ({ ...current, [groupId]: true }));
  };

  const handleMoveStudent = async (studentId: string, newGroupId: string) => {
    setMovingStudentId(studentId);
    try {
      const api = role === "admin" ? adminApi : professorApi;
      await api.groups.moveStudentToGroup(studentId, newGroupId);
      setSelectedGroupByStudent((current) => {
        const updated = { ...current };
        delete updated[studentId];
        return updated;
      });
      await refetchDetail();
    } finally {
      setMovingStudentId(null);
    }
  };

  if (detailLoading) return <Spinner />;

  if (detailError || !detail) {
    return (
      <ErrorState
        description={detailError ?? LABELS.common.noResults}
        title={LABELS.common.retry}
      />
    );
  }

  const renderOverview = () => (
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

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-900">
          Kapacitet grupa
        </h3>
        {groups.map((group) => (
          <div className="grid gap-2" key={group.id}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">{group.name}</p>
              <p className="text-xs text-slate-500">
                {group.currentCount}/{group.capacity}
              </p>
            </div>
            <CapacityBar current={group.currentCount} max={group.capacity} />
          </div>
        ))}
      </div>
    </section>
  );

  const renderStudents = () => (
    <section className="grid gap-4">
      <Input
        label="Pretraži studente"
        placeholder="Unesite ime ili e-mail"
        value={studentSearch}
        onChange={(e) => setStudentSearch(e.target.value)}
        type="text"
      />
      {[...studentsByGroup.entries()].map(([groupId, groupStudents]) => {
        const title =
          groupId === "unassigned"
            ? "Neraspoređeni"
            : (groups.find((g) => g.id === groupId)?.name ?? "Grupa");

        return (
          <div className="grid gap-3" key={groupId}>
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            {groupStudents.length === 0 ? (
              <p className="text-sm text-slate-500">Nema studenata.</p>
            ) : (
              groupStudents.map((student) => (
                <StudentMoveRow
                  currentGroupLabel={student.currentGroupName ?? "-"}
                  groupOptions={groupOptions}
                  isMoving={movingStudentId === student.id}
                  key={student.id}
                  onGroupChange={(value) =>
                    setSelectedGroupByStudent((current) => ({
                      ...current,
                      [student.id]: value,
                    }))
                  }
                  onMove={(selectedGroupId) =>
                    handleMoveStudent(student.id, selectedGroupId)
                  }
                  selectedGroupId={selectedGroupByStudent[student.id]}
                  studentEmail={student.email}
                  studentName={`${student.firstName} ${student.lastName}`}
                />
              ))
            )}
          </div>
        );
      })}
    </section>
  );

  const renderRequests = () => (
    <section className="grid gap-4">
      <FilterTabs
        activeValue={activeRequestTab}
        onChange={setActiveRequestTab}
        tabs={requestTabs}
      />
      {!courseRequests.length ? (
        <EmptyState
          description="Nema zahtjeva za odabrani filter."
          title={LABELS.common.noResults}
        />
      ) : (
        courseRequests.map((request) => (
          <div className="grid gap-0" key={request.id}>
            <SwapRequestCard request={request} />
            {request.status === SwapRequestStatus.PENDING ? (
              <div className="flex flex-wrap gap-2 px-4 py-3 bg-white border border-t-0 border-slate-200 rounded-b-lg">
                <Button
                  disabled={actionId === request.id}
                  onClick={() => handleApprove(request.id)}
                  size="sm"
                  variant="success"
                >
                  Prihvati
                </Button>
                <Button
                  disabled={actionId === request.id}
                  onClick={() => handleReject(request.id)}
                  size="sm"
                  variant="danger"
                >
                  Odbij
                </Button>
              </div>
            ) : null}
          </div>
        ))
      )}
    </section>
  );

  const renderGroups = () => (
    <section className="grid gap-4">
      {groups.map((group) => {
        const capacityValue = capacityDrafts[group.id] ?? group.capacity;
        const hasCapacityWarning = capacityValue < group.currentCount;

        return (
          <article
            className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4"
            key={group.id}
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900">
                {group.name}
              </h3>
              {reportedGroupIds[group.id] ? (
                <Badge size="sm" variant="warning">
                  IT PRIJAVA U TIJEKU
                </Badge>
              ) : null}
            </div>

            <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-end">
              <Input
                hint={
                  hasCapacityWarning
                    ? `Kapacitet je manji od trenutnog broja (${group.currentCount}).`
                    : `Trenutno: ${group.currentCount} studenata`
                }
                label="Maksimalni kapacitet"
                onChange={(event) =>
                  setCapacityDrafts((current) => ({
                    ...current,
                    [group.id]: Number(event.target.value || group.capacity),
                  }))
                }
                type="number"
                value={String(capacityValue)}
              />
              <Button
                disabled={hasCapacityWarning}
                onClick={() => saveCapacity(group)}
                size="sm"
                variant="outline"
              >
                Spremi kapacitet
              </Button>
            </div>

            <div className="grid gap-2 border-t border-slate-200 pt-3">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Opis IT problema
                </span>
                <textarea
                  className="min-h-24 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                  onChange={(event) =>
                    setIssueDrafts((current) => ({
                      ...current,
                      [group.id]: event.target.value,
                    }))
                  }
                  placeholder="Opišite problem za IT podršku"
                  value={issueDrafts[group.id] ?? ""}
                />
              </label>
              <div className="flex justify-end">
                <Button
                  onClick={() => void sendIssueReport(group.id)}
                  size="sm"
                >
                  Pošalji IT prijavu
                </Button>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );

  return (
    <section className="grid gap-4">
      <h2 className="text-xl font-semibold text-slate-900">
        {detail.course.title}
      </h2>
      <FilterTabs
        activeValue={activeTab}
        onChange={setActiveTab}
        tabs={courseTabs}
      />
      {activeTab === "overview" ? renderOverview() : null}
      {activeTab === "students" ? renderStudents() : null}
      {activeTab === "requests" ? renderRequests() : null}
      {activeTab === "groups" ? renderGroups() : null}
    </section>
  );
}
