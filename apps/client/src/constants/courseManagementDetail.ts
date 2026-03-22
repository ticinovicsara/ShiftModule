import {
  CourseManagementRequestTab,
  CourseManagementTab,
  SessionKind,
} from "@repo/types";

export const COURSE_TABS = [
  { label: "Overview", value: CourseManagementTab.OVERVIEW },
  { label: "Students", value: CourseManagementTab.STUDENTS },
  { label: "Swap Requests", value: CourseManagementTab.REQUESTS },
  { label: "Groups / Capacity", value: CourseManagementTab.GROUPS },
] as const;

export const REQUEST_TABS = [
  { label: "All", value: CourseManagementRequestTab.ALL },
  { label: "Pending manual", value: CourseManagementRequestTab.MANUAL },
  { label: "Automatic", value: CourseManagementRequestTab.AUTOMATIC },
  { label: "Odobreni", value: CourseManagementRequestTab.APPROVED },
  { label: "Odbijeni", value: CourseManagementRequestTab.REJECTED },
] as const;

export const REQUEST_REJECT_REASON = "Odbijeno";

export const SESSION_TYPE_TABS: ReadonlyArray<{
  label: string;
  value: SessionKind;
}> = [
  { label: "Laboratorijske vježbe", value: SessionKind.LAB },
  { label: "Auditorne vježbe", value: SessionKind.EXERCISE },
];
