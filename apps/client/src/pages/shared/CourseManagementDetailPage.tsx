import {
  CourseManagementRequestTab,
  CourseManagementTab,
  SessionKind,
  UserRole,
} from "@repo/types";
import { useCallback, useMemo, useState } from "react";
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

  const {
    data: requests,
    approve,
    reject,
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

  const studentsForSelectedKind = useMemo(
    () =>
      selectStudentsBySessionKind(students, studentsSessionKind, studentSearch),
    [students, studentsSessionKind, studentSearch],
  );

  const studentGroupOptionsByStudentId = useMemo(
    () => buildStudentGroupOptionsByStudentId(groups, studentsForSelectedKind),
    [groups, studentsForSelectedKind],
  );

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
