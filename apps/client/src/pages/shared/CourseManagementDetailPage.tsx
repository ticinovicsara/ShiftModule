import {
  CourseManagementRequestTab,
  CourseManagementTab,
  SessionKind,
  SwapRequestStatus,
  type User,
  UserRole,
} from "@repo/types";
import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { adminApi, professorApi } from "../../api";
import {
  GroupsSection,
  FilterTabs,
  OverviewSection,
  RequestsSection,
  StudentsSection,
} from "../../components/shared";
import { ErrorState, Spinner } from "../../components/ui";
import { COURSE_TABS, LABELS } from "../../constants";
import {
  useCourseManagementActions,
  useFetch,
  useGroups,
  useSwapRequests,
} from "../../hooks";
import type {
  CourseDetailPayload,
  CourseRequestTab,
  CourseTab,
} from "../../types";
import {
  buildStudentGroupOptionsByStudentId,
  filterCourseRequests,
  groupCourseGroupsBySessionKind,
  selectStudentsBySessionKind,
} from "../../utils";

interface CourseManagementDetailPageProps {
  courseId: string;
  role: UserRole.ADMIN | UserRole.PROFESSOR;
}

export function CourseManagementDetailPage({
  courseId,
  role,
}: CourseManagementDetailPageProps) {
  const [activeTab, setActiveTab] = useState<CourseTab>(
    CourseManagementTab.OVERVIEW,
  );
  const [activeRequestTab, setActiveRequestTab] = useState<CourseRequestTab>(
    CourseManagementRequestTab.ALL,
  );
  const [studentsSessionKind, setStudentsSessionKind] = useState<SessionKind>(
    SessionKind.LAB,
  );
  const [groupsSessionKind, setGroupsSessionKind] = useState<SessionKind>(
    SessionKind.LAB,
  );
  const [selectedGroupIdForCapacity, setSelectedGroupIdForCapacity] =
    useState<string>("");
  const [capacityDrafts, setCapacityDrafts] = useState<Record<string, number>>(
    {},
  );
  const [issueDescription, setIssueDescription] = useState("");
  const [selectedGroupByStudent, setSelectedGroupByStudent] = useState<
    Record<string, string>
  >({});
  const [studentSearch, setStudentSearch] = useState<string>("");
  const [selectedStudentIdForEnroll, setSelectedStudentIdForEnroll] =
    useState<string>("");
  const [importJson, setImportJson] = useState<string>("");
  const [enrollingWithoutGroup, setEnrollingWithoutGroup] = useState(false);
  const [importingStudents, setImportingStudents] = useState(false);
  const [autoAssigningUngrouped, setAutoAssigningUngrouped] = useState(false);

  const fetchCourseDetail = useCallback(
    () =>
      role === UserRole.ADMIN
        ? adminApi.courses.getById(courseId)
        : professorApi.courses.getById(courseId),
    [courseId, role],
  );

  const {
    data: detail,
    loading: detailLoading,
    error: detailError,
    refetch: refetchDetail,
  } = useFetch<CourseDetailPayload>(fetchCourseDetail);

  const { data: allStudents } = useFetch<User[]>(
    useCallback(
      () =>
        role === UserRole.ADMIN
          ? adminApi.users.getStudents()
          : Promise.resolve([]),
      [role],
    ),
  );

  const {
    data: requests,
    approve,
    reject,
    approveAll,
    rejectAll,
    refetch: refetchRequests,
  } = useSwapRequests();

  const { updateCapacity } = useGroups();

  const {
    actionId,
    movingStudentId,
    reportingIssue,
    issueReported,
    saveCapacity,
    sendCourseIssueReport,
    handleApprove,
    handleReject,
    handleMoveStudent,
  } = useCourseManagementActions({
    role,
    courseId,
    issueDescription,
    approve,
    reject,
    updateCapacity,
    refetchDetail,
    refetchRequests,
    clearSelectedGroupForStudent: (studentId) =>
      setSelectedGroupByStudent((current) => {
        const updated = { ...current };
        delete updated[studentId];
        return updated;
      }),
  });

  const groups = detail?.groups ?? [];
  const students = detail?.students ?? [];
  const sessionTypes = detail?.sessionTypes ?? [];

  const groupsByKind = useMemo(
    () => groupCourseGroupsBySessionKind(groups, sessionTypes),
    [groups, sessionTypes],
  );

  const labGroups = groupsByKind[SessionKind.LAB];
  const exerciseGroups = groupsByKind[SessionKind.EXERCISE];

  const totalStudentsForKind = useCallback(
    (kind: SessionKind) =>
      (groupsByKind[kind] ?? []).reduce(
        (sum, group) => sum + group.currentCount,
        0,
      ),
    [groupsByKind],
  );

  const courseRequests = useMemo(
    () => filterCourseRequests(requests, courseId, activeRequestTab),
    [requests, courseId, activeRequestTab],
  );

  const allPendingCourseRequestIds = useMemo(
    () =>
      filterCourseRequests(requests, courseId, CourseManagementRequestTab.ALL)
        .filter((request) => request.status === SwapRequestStatus.PENDING)
        .map((request) => request.id),
    [requests, courseId],
  );

  const showBulkResultToast = useCallback(
    (actionLabel: string, processed: number, skipped: number) => {
      if (skipped > 0) {
        toast.success(
          `${actionLabel} ${processed} zahtjeva, preskočeno ${skipped} (već obrađeno u paralelnom toku).`,
        );
        return;
      }

      toast.success(`${actionLabel} ${processed} zahtjeva.`);
    },
    [],
  );

  const studentsForSelectedKind = useMemo(
    () =>
      selectStudentsBySessionKind(students, studentsSessionKind, studentSearch),
    [students, studentsSessionKind, studentSearch],
  );

  const groupsForStudentsKind = useMemo(
    () => groupsByKind[studentsSessionKind] ?? [],
    [groupsByKind, studentsSessionKind],
  );

  const studentGroupOptionsByStudentId = useMemo(
    () =>
      buildStudentGroupOptionsByStudentId(
        groupsForStudentsKind,
        studentsForSelectedKind,
      ),
    [groupsForStudentsKind, studentsForSelectedKind],
  );

  const studentOptionsForEnroll = useMemo(() => {
    if (role !== UserRole.ADMIN) {
      return [];
    }

    const enrolledStudentIds = new Set(students.map((student) => student.id));

    return (allStudents ?? [])
      .filter((student) => !enrolledStudentIds.has(student.id))
      .map((student) => ({
        label: `${student.firstName} ${student.lastName}`,
        value: student.id,
        description: student.email,
      }));
  }, [allStudents, role, students]);

  const handleEnrollWithoutGroup = useCallback(async () => {
    if (role !== UserRole.ADMIN || !selectedStudentIdForEnroll) {
      return;
    }

    setEnrollingWithoutGroup(true);
    try {
      const result = await adminApi.studentManagement.enrollWithoutGroup(
        courseId,
        selectedStudentIdForEnroll,
      );

      toast.success(
        result.alreadyEnrolled
          ? "Student je već upisan na kolegij."
          : "Student je upisan bez grupe.",
      );

      setSelectedStudentIdForEnroll("");
      await refetchDetail();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Upis studenta nije uspio.",
      );
    } finally {
      setEnrollingWithoutGroup(false);
    }
  }, [courseId, refetchDetail, role, selectedStudentIdForEnroll]);

  const handleImportStudents = useCallback(async () => {
    if (role !== UserRole.ADMIN || !importJson.trim()) {
      return;
    }

    setImportingStudents(true);
    try {
      let parsedPayload: unknown;
      try {
        parsedPayload = JSON.parse(importJson);
      } catch {
        toast.error("JSON format nije ispravan.");
        return;
      }

      if (typeof parsedPayload !== "object" || parsedPayload === null) {
        toast.error("JSON mora biti objekt ili polje.");
        return;
      }

      const result =
        await adminApi.studentManagement.importExistingStudentsToCourse(
          courseId,
          parsedPayload as Record<string, unknown> | unknown[],
        );

      toast.success(
        `Import završen: upisano ${result.enrolledCount}, već upisano ${result.alreadyEnrolledCount}, nije pronađeno ${result.notFoundCount}.`,
      );

      await refetchDetail();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Import studenata nije uspio.",
      );
    } finally {
      setImportingStudents(false);
    }
  }, [courseId, importJson, refetchDetail, role]);

  const handleAutoAssignUngrouped = useCallback(async () => {
    if (role !== UserRole.ADMIN && role !== UserRole.PROFESSOR) {
      return;
    }

    setAutoAssigningUngrouped(true);
    try {
      const result = await adminApi.studentManagement.autoAssignUngrouped(
        courseId,
        studentsSessionKind,
      );

      toast.success(
        `Automatska raspodjela završena: ${result.createdAssignments} novih dodjela, ${result.unresolved} neriješenih.`,
      );

      await refetchDetail();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Automatska raspodjela nije uspjela.",
      );
    } finally {
      setAutoAssigningUngrouped(false);
    }
  }, [courseId, refetchDetail, role, studentsSessionKind]);

  const handleApproveAllPending = useCallback(async () => {
    if (!allPendingCourseRequestIds.length) {
      toast.error("Nema zahtjeva na čekanju.");
      return;
    }

    try {
      const result = await approveAll(allPendingCourseRequestIds);
      await refetchRequests();
      showBulkResultToast("Odobreno", result.approved, result.skipped);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Masovno odobravanje nije uspjelo.",
      );
    }
  }, [
    allPendingCourseRequestIds,
    approveAll,
    refetchRequests,
    showBulkResultToast,
  ]);

  const handleRejectAllPending = useCallback(async () => {
    if (!allPendingCourseRequestIds.length) {
      toast.error("Nema zahtjeva na čekanju.");
      return;
    }

    try {
      const result = await rejectAll({
        ids: allPendingCourseRequestIds,
        dto: { reason: "Odbijeno" },
      });
      await refetchRequests();
      showBulkResultToast("Odbijeno", result.rejected, result.skipped);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Masovno odbijanje nije uspjelo.",
      );
    }
  }, [
    allPendingCourseRequestIds,
    refetchRequests,
    rejectAll,
    showBulkResultToast,
  ]);

  const groupsForCapacityKind =
    groupsSessionKind === SessionKind.LAB ? labGroups : exerciseGroups;

  const selectedGroupForCapacity = useMemo(() => {
    if (!selectedGroupIdForCapacity) {
      return null;
    }

    return (
      groupsForCapacityKind.find(
        (group) => group.id === selectedGroupIdForCapacity,
      ) ?? null
    );
  }, [groupsForCapacityKind, selectedGroupIdForCapacity]);

  if (detailLoading) return <Spinner />;

  if (detailError || !detail) {
    return (
      <ErrorState
        description={detailError ?? LABELS.common.noResults}
        title={LABELS.common.retry}
      />
    );
  }

  const selectedCapacity = selectedGroupForCapacity
    ? (capacityDrafts[selectedGroupForCapacity.id] ??
      selectedGroupForCapacity.capacity)
    : 0;

  const hasCapacityWarning = selectedGroupForCapacity
    ? selectedCapacity < selectedGroupForCapacity.currentCount
    : false;

  return (
    <section className="grid gap-4">
      <h2 className="text-xl font-semibold text-slate-900">
        {detail.course.title}
      </h2>
      <FilterTabs
        activeValue={activeTab}
        onChange={(value) => setActiveTab(value as CourseTab)}
        tabs={COURSE_TABS.map((tab) => ({
          label: tab.label,
          value: tab.value,
        }))}
      />
      {activeTab === CourseManagementTab.OVERVIEW ? (
        <OverviewSection
          detail={detail}
          exerciseGroups={exerciseGroups}
          labGroups={labGroups}
          totalStudentsForKind={totalStudentsForKind}
        />
      ) : null}
      {activeTab === CourseManagementTab.STUDENTS ? (
        <StudentsSection
          adminControls={
            role === UserRole.ADMIN
              ? {
                  selectedStudentId: selectedStudentIdForEnroll,
                  setSelectedStudentId: setSelectedStudentIdForEnroll,
                  studentOptions: studentOptionsForEnroll,
                  onEnrollWithoutGroup: handleEnrollWithoutGroup,
                  enrolling: enrollingWithoutGroup,
                  importJson,
                  setImportJson,
                  onImportStudents: handleImportStudents,
                  importing: importingStudents,
                }
              : undefined
          }
          autoAssignControls={
            role === UserRole.ADMIN || role === UserRole.PROFESSOR
              ? {
                  onAutoAssign: handleAutoAssignUngrouped,
                  autoAssigning: autoAssigningUngrouped,
                }
              : undefined
          }
          movingStudentId={movingStudentId}
          onGroupChange={(studentId, value) =>
            setSelectedGroupByStudent((current) => ({
              ...current,
              [studentId]: value,
            }))
          }
          onMoveStudent={handleMoveStudent}
          selectedGroupByStudent={selectedGroupByStudent}
          setStudentSearch={setStudentSearch}
          setStudentsSessionKind={setStudentsSessionKind}
          groupsForSelectedKind={groupsForStudentsKind}
          studentGroupOptionsByStudentId={studentGroupOptionsByStudentId}
          studentSearch={studentSearch}
          studentsForSelectedKind={studentsForSelectedKind}
          studentsSessionKind={studentsSessionKind}
        />
      ) : null}
      {activeTab === CourseManagementTab.REQUESTS ? (
        <RequestsSection
          actionId={actionId}
          activeRequestTab={activeRequestTab}
          courseRequests={courseRequests}
          onApprove={handleApprove}
          onReject={handleReject}
          onApproveAllPending={handleApproveAllPending}
          onRejectAllPending={handleRejectAllPending}
          showPriorityInfo={role === UserRole.PROFESSOR}
          showSatisfactionInfo
          setActiveRequestTab={setActiveRequestTab}
        />
      ) : null}
      {activeTab === CourseManagementTab.GROUPS ? (
        <GroupsSection
          groupsForCapacityKind={groupsForCapacityKind}
          groupsSessionKind={groupsSessionKind}
          hasCapacityWarning={hasCapacityWarning}
          issueDescription={issueDescription}
          issueReported={issueReported}
          onCapacityChange={(groupId, nextCapacity) =>
            setCapacityDrafts((current) => ({
              ...current,
              [groupId]: nextCapacity,
            }))
          }
          onSaveCapacity={(group) =>
            saveCapacity(group, capacityDrafts[group.id] ?? group.capacity)
          }
          onSendIssueReport={sendCourseIssueReport}
          reportingIssue={reportingIssue}
          selectedCapacity={selectedCapacity}
          selectedGroupForCapacity={selectedGroupForCapacity}
          selectedGroupIdForCapacity={selectedGroupIdForCapacity}
          setGroupsSessionKind={setGroupsSessionKind}
          setIssueDescription={setIssueDescription}
          setSelectedGroupIdForCapacity={setSelectedGroupIdForCapacity}
        />
      ) : null}
    </section>
  );
}
