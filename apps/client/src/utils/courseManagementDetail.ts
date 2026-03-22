import {
  CourseManagementRequestTab,
  SessionKind,
  SwapRequestStatus,
  type SwapRequest,
} from "@repo/types";
import type { SelectOption } from "../components/ui";
import type {
  CourseGroup,
  CourseRequestTab,
  CourseStudent,
  StudentWithSelectedAssignment,
} from "../types";

export function groupCourseGroupsBySessionKind(
  groups: CourseGroup[],
  sessionTypes: Array<{ id: string; type: SessionKind }>,
): Record<SessionKind, CourseGroup[]> {
  const sessionTypeKindById = new Map(
    sessionTypes.map((sessionType) => [sessionType.id, sessionType.type]),
  );

  const grouped: Record<SessionKind, CourseGroup[]> = {
    [SessionKind.LAB]: [],
    [SessionKind.EXERCISE]: [],
    [SessionKind.LECTURE]: [],
  };

  for (const group of groups) {
    const kind = sessionTypeKindById.get(group.sessionTypeId);
    if (kind) {
      grouped[kind].push(group);
    }
  }

  return grouped;
}

export function filterCourseRequests(
  requests: SwapRequest[] | null | undefined,
  courseId: string,
  activeRequestTab: CourseRequestTab,
): SwapRequest[] {
  return (requests ?? []).filter((request) => {
    if (request.courseId !== courseId) {
      return false;
    }

    if (activeRequestTab === CourseManagementRequestTab.MANUAL) {
      return request.status === SwapRequestStatus.PENDING;
    }

    if (activeRequestTab === CourseManagementRequestTab.AUTOMATIC) {
      return request.status === SwapRequestStatus.AUTO_RESOLVED;
    }

    if (activeRequestTab === CourseManagementRequestTab.APPROVED) {
      return request.status === SwapRequestStatus.APPROVED;
    }

    if (activeRequestTab === CourseManagementRequestTab.REJECTED) {
      return request.status === SwapRequestStatus.REJECTED;
    }

    return true;
  });
}

export function selectStudentsBySessionKind(
  students: CourseStudent[],
  studentsSessionKind: SessionKind,
  studentSearch: string,
): StudentWithSelectedAssignment[] {
  return students
    .filter((student) => {
      const assignment = student.assignments.find(
        (entry) => entry.sessionKind === studentsSessionKind,
      );
      if (!assignment) {
        return false;
      }

      if (!studentSearch.trim()) {
        return true;
      }

      const searchLower = studentSearch.toLowerCase();
      const name = `${student.firstName} ${student.lastName}`.toLowerCase();
      const email = student.email.toLowerCase();

      return name.includes(searchLower) || email.includes(searchLower);
    })
    .map((student) => {
      const assignment = student.assignments.find(
        (entry) => entry.sessionKind === studentsSessionKind,
      );

      return {
        ...student,
        selectedAssignment: assignment ?? null,
      };
    });
}

export function buildStudentGroupOptionsByStudentId(
  groups: CourseGroup[],
  studentsForSelectedKind: StudentWithSelectedAssignment[],
): Map<string, SelectOption[]> {
  const options = new Map<string, SelectOption[]>();

  for (const student of studentsForSelectedKind) {
    const assignment = student.selectedAssignment;
    if (!assignment) {
      options.set(student.id, []);
      continue;
    }

    const sameTypeGroups = groups.filter(
      (group) => group.sessionTypeId === assignment.sessionTypeId,
    );

    options.set(
      student.id,
      sameTypeGroups.map((group) => ({
        label:
          group.id === assignment.groupId
            ? `${group.name} (trenutna)`
            : group.name,
        value: group.id,
        disabled: group.id === assignment.groupId,
        description: `${group.currentCount}/${group.capacity}`,
      })),
    );
  }

  return options;
}
