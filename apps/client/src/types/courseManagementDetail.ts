import type {
  CourseManagementRequestTab,
  CourseManagementTab,
  SessionKind,
} from "@repo/types";

export interface CourseStudent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  currentGroupId?: string;
  currentGroupName?: string;
  assignments: Array<{
    sessionTypeId: string;
    sessionKind?: SessionKind;
    groupId: string;
    groupName: string;
  }>;
}

export interface CourseGroup {
  id: string;
  name: string;
  capacity: number;
  currentCount: number;
  isActive: boolean;
  sessionTypeId: string;
}

export interface CourseDetailPayload {
  course: {
    id: string;
    title: string;
  };
  groups: CourseGroup[];
  sessionTypes: Array<{ id: string; type: SessionKind }>;
  students: CourseStudent[];
  stats: {
    totalStudents: number;
    groupsCount: number;
    pendingSwapRequests: number;
  };
}

export interface StudentWithSelectedAssignment extends CourseStudent {
  selectedAssignment: CourseStudent["assignments"][number] | null;
}

export type CourseTab = CourseManagementTab;

export type CourseRequestTab = CourseManagementRequestTab;
