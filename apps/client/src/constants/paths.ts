import { UserRole } from "@repo/types";

export const ROUTE_PATHS = {
  login: "/login",
  unauthorized: "/unauthorized",
  notFound: "/not-found",
  routePatterns: {
    adminCourseDetail: "/admin/courses/:id",
    adminAutoAssign: "/admin/auto-assign/:courseId",
    professorCourseDetail: "/professor/courses/:id",
    professorCourseRequests: "/professor/courses/:id/requests",
    professorRequestDetail: "/professor/courses/:id/requests/:requestId",
    professorCourseGroups: "/professor/courses/:id/groups",
    professorAutoLog: "/professor/auto-log/:courseId",
    studentCourseDetail: "/student/courses/:id",
    studentSwapStep1: "/student/courses/:id/swap/step-1",
    studentSwapStep2: "/student/courses/:id/swap/step-2",
    studentRequestDetail: "/student/requests/:id",
    confirmSwap: "/confirm-swap/:requestId",
  },
  confirmSwap: (requestId: string) => `/confirm-swap/${requestId}`,
  admin: {
    dashboard: "/admin/dashboard",
    students: "/admin/students",
    studentsImport: "/admin/students/import",
    courses: "/admin/courses",
    courseDetail: (id: string) => `/admin/courses/${id}`,
    groups: "/admin/groups",
    studyMajors: "/admin/study-majors",
    autoAssign: (courseId: string) => `/admin/auto-assign/${courseId}`,
  },
  professor: {
    dashboard: "/professor/dashboard",
    courses: "/professor/courses",
    courseDetail: (id: string) => `/professor/courses/${id}`,
    courseRequests: (id: string) => `/professor/courses/${id}/requests`,
    requestDetail: (id: string, requestId: string) =>
      `/professor/courses/${id}/requests/${requestId}`,
    courseGroups: (id: string) => `/professor/courses/${id}/groups`,
    autoLog: (courseId: string) => `/professor/auto-log/${courseId}`,
  },
  student: {
    courses: "/student/courses",
    courseDetail: (id: string) => `/student/courses/${id}`,
    swapStep1: (id: string) => `/student/courses/${id}/swap/step-1`,
    swapStep2: (id: string) => `/student/courses/${id}/swap/step-2`,
    requests: "/student/requests",
    requestDetail: (id: string) => `/student/requests/${id}`,
  },
} as const;

export const DEFAULT_ROUTE_BY_ROLE: Record<UserRole, string> = {
  [UserRole.ADMIN]: ROUTE_PATHS.admin.dashboard,
  [UserRole.PROFESSOR]: ROUTE_PATHS.professor.dashboard,
  [UserRole.STUDENT]: ROUTE_PATHS.student.courses,
};
