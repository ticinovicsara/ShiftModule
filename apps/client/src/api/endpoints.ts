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

    sessionTypes: "/admin/session-types",
    sessionTypeById: (id: string) => `/admin/session-types/${id}`,
    sessionTypesByCourse: (courseId: string) =>
      `/admin/session-types/course/${courseId}`,
  },
  professor: {
    courses: "/professor/courses",
    courseById: (id: string) => `/professor/courses/${id}`,
    courseSwapMode: (id: string) => `/professor/courses/${id}/swap-mode`,

    swapRequests: "/swap-request/professor/requests",
    approveSwapRequest: (id: string) =>
      `/swap-request/professor/requests/${id}/approve`,
    rejectSwapRequest: (id: string) =>
      `/swap-request/professor/requests/${id}/reject`,

    reportIssue: (id: string) => `/groups/${id}/report-issue`,
  },
  student: {
    courses: "/student/courses",
    requests: "/student/requests",

    swapRequests: "/swap-request/student/requests",
    confirmPartner: (id: string) =>
      `/swap-request/student/requests/${id}/confirm-partner`,
  },
} as const;
