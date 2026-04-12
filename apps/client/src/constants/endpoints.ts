import type { UserRole } from "@repo/types";

export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
  },
  admin: {
    users: "/admin/users",
    usersByRole: (
      role: UserRole.ADMIN | UserRole.PROFESSOR | UserRole.STUDENT,
    ) => `/admin/users?role=${role}`,
    userById: (id: string) => `/admin/users/${id}`,
    studyMajors: "/admin/study-majors",
    studyMajorById: (id: string) => `/admin/study-majors/${id}`,
    courses: "/admin/courses",
    courseById: (id: string) => `/admin/courses/${id}`,
    assignProfessor: (id: string) => `/admin/courses/${id}/assign-professor`,
    groups: "/admin/groups",
    groupById: (id: string) => `/admin/groups/${id}`,
    groupCapacity: (id: string) => `/admin/groups/${id}/capacity`,
    moveStudentToGroup: (studentId: string, groupId: string) =>
      `/admin/students/${studentId}/move-to-group/${groupId}`,
    enrollStudentWithoutGroup: (courseId: string, studentId: string) =>
      `/student/admin/courses/${courseId}/students/${studentId}/enroll`,
    autoAssignUngroupedStudents: (courseId: string) =>
      `/student/admin/courses/${courseId}/students/auto-assign`,
    importStudentsToCourse: (courseId: string) =>
      `/student/admin/courses/${courseId}/students/import`,
    sessionTypes: "/session-types",
    sessionTypeById: (id: string) => `/session-types/${id}`,
    sessionTypesByCourse: (courseId: string) =>
      `/session-types/course/${courseId}`,
    swapRequests: "/swap-requests/admin/requests",
    swapRequestsByCourse: (courseId: string) =>
      `/swap-requests/admin/requests?courseId=${courseId}`,
  },
  professor: {
    courses: "/professor/courses",
    courseById: (id: string) => `/professor/courses/${id}`,
    courseSwapMode: (id: string) => `/professor/courses/${id}/swap-mode`,
    courseReportIssue: (id: string) => `/courses/${id}/report-issue`,
    dashboardStats: "/professor/dashboard/stats",
    swapRequests: "/swap-requests/professor/requests",
  },
  swapRequests: {
    approve: (id: string) => `/swap-requests/requests/${id}/approve`,
    reject: (id: string) => `/swap-requests/requests/${id}/reject`,
    bulkApprove: "/swap-requests/requests/bulk/approve",
    bulkReject: "/swap-requests/requests/bulk/reject",
  },
  student: {
    courses: "/student/courses",
    courseOverviews: "/student/course-overviews",
    courseById: (id: string) => `/student/courses/${id}`,
    courseStudents: (id: string) => `/student/courses/${id}/students`,
    requests: "/student/requests",
    swapRequests: "/swap-requests/student/requests",
    cancelSwapRequest: (id: string) => `/swap-requests/student/requests/${id}`,
    updateSwapRequest: (id: string) =>
      `/swap-requests/student/requests/${id}/update`,
    confirmPartner: (id: string) =>
      `/swap-requests/student/requests/${id}/confirm-partner`,
    declinePartner: (id: string) =>
      `/swap-requests/student/requests/${id}/decline-partner`,
  },
} as const;
