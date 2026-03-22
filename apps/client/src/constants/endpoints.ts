export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
  },
  admin: {
    users: "/admin/users",
    userById: (id: string) => `/admin/users/${id}`,
    usersImport: "/admin/users/import",
    usersStudents: "/admin/users/students",
    usersProfessors: "/admin/users/professors",
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
    sessionTypes: "/admin/session-types",
    sessionTypeById: (id: string) => `/admin/session-types/${id}`,
    sessionTypesByCourse: (courseId: string) =>
      `/admin/session-types/course/${courseId}`,
    swapRequests: "/swap-request/admin/requests",
    swapRequestsByCourse: (courseId: string) =>
      `/swap-request/admin/requests?courseId=${courseId}`,
  },
  professor: {
    courses: "/professor/courses",
    courseById: (id: string) => `/professor/courses/${id}`,
    courseSwapMode: (id: string) => `/professor/courses/${id}/swap-mode`,
    courseReportIssue: (id: string) => `/courses/${id}/report-issue`,
    dashboardStats: "/professor/dashboard/stats",
    swapRequests: "/swap-request/professor/requests",
  },
  swapRequests: {
    approve: (id: string) => `/swap-request/requests/${id}/approve`,
    reject: (id: string) => `/swap-request/requests/${id}/reject`,
  },
  student: {
    courses: "/student/courses",
    courseOverviews: "/student/course-overviews",
    courseById: (id: string) => `/student/courses/${id}`,
    requests: "/student/requests",
    swapRequests: "/swap-request/student/requests",
    confirmPartner: (id: string) =>
      `/swap-request/student/requests/${id}/confirm-partner`,
    declinePartner: (id: string) =>
      `/swap-request/student/requests/${id}/decline-partner`,
  },
} as const;
