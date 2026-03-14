import { UserRole } from "@repo/types";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthLayout } from "../layouts/AuthLayout";
import { AppLayout } from "../layouts/AppLayout";
import { AdminCourseDetailPage } from "../pages/admin/AdminCourseDetailPage";
import { AdminCoursesPage } from "../pages/admin/AdminCoursesPage";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { AdminImportPage } from "../pages/admin/AdminImportPage";
import { AdminStudentsPage } from "../pages/admin/AdminStudentsPage";
import { LoginPage } from "../pages/auth/LoginPage";
import { ProfessorAutoLogPage } from "../pages/professor/ProfessorAutoLogPage";
import { ProfessorCourseDetailPage } from "../pages/professor/ProfessorCourseDetailPage";
import { ProfessorCoursesPage } from "../pages/professor/ProfessorCoursesPage";
import { ProfessorRequestDetailPage } from "../pages/professor/ProfessorRequestDetailPage";
import { NotFoundPage } from "../pages/shared/NotFoundPage";
import { UnauthorizedPage } from "../pages/shared/UnauthorizedPage";
import { StudentCourseDetailPage } from "../pages/student/StudentCourseDetailPage";
import { StudentCoursesPage } from "../pages/student/StudentCoursesPage";
import { StudentRequestsPage } from "../pages/student/StudentRequestsPage";
import { StudentSwapStep1Page } from "../pages/student/StudentSwapStep1Page";
import { StudentSwapStep2Page } from "../pages/student/StudentSwapStep2Page";
import { ROUTE_PATHS } from "../constants";
import { ProtectedRoute } from "./ProtectedRoute";
import { ConfirmSwapPage } from "../pages/shared/ConfirmSwapPage";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path={ROUTE_PATHS.login} element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
        <Route element={<AppLayout />}>
          <Route
            path={ROUTE_PATHS.admin.dashboard}
            element={<AdminDashboardPage />}
          />
          <Route
            path={ROUTE_PATHS.admin.students}
            element={<AdminStudentsPage />}
          />
          <Route
            path={ROUTE_PATHS.admin.studentsImport}
            element={<AdminImportPage />}
          />
          <Route
            path={ROUTE_PATHS.admin.courses}
            element={<AdminCoursesPage />}
          />
          <Route
            path={ROUTE_PATHS.routePatterns.adminCourseDetail}
            element={<AdminCourseDetailPage />}
          />
          <Route
            path={ROUTE_PATHS.admin.groups}
            element={<AdminCoursesPage />}
          />
          <Route
            path={ROUTE_PATHS.admin.studyMajors}
            element={<AdminCoursesPage />}
          />
          <Route
            path={ROUTE_PATHS.routePatterns.adminAutoAssign}
            element={<AdminCourseDetailPage />}
          />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[UserRole.PROFESSOR]} />}>
        <Route element={<AppLayout />}>
          <Route
            path={ROUTE_PATHS.professor.dashboard}
            element={<ProfessorCoursesPage />}
          />
          <Route
            path={ROUTE_PATHS.professor.courses}
            element={<ProfessorCoursesPage />}
          />
          <Route
            path={ROUTE_PATHS.routePatterns.professorCourseDetail}
            element={<ProfessorCourseDetailPage />}
          />
          <Route
            path={ROUTE_PATHS.routePatterns.professorCourseRequests}
            element={<ProfessorCourseDetailPage />}
          />
          <Route
            path={ROUTE_PATHS.routePatterns.professorRequestDetail}
            element={<ProfessorRequestDetailPage />}
          />
          <Route
            path={ROUTE_PATHS.routePatterns.professorCourseGroups}
            element={<ProfessorCourseDetailPage />}
          />
          <Route
            path={ROUTE_PATHS.routePatterns.professorAutoLog}
            element={<ProfessorAutoLogPage />}
          />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[UserRole.STUDENT]} />}>
        <Route element={<AppLayout />}>
          <Route
            path={ROUTE_PATHS.student.courses}
            element={<StudentCoursesPage />}
          />
          <Route
            path={ROUTE_PATHS.routePatterns.studentCourseDetail}
            element={<StudentCourseDetailPage />}
          />
          <Route
            path={ROUTE_PATHS.routePatterns.studentSwapStep1}
            element={<StudentSwapStep1Page />}
          />
          <Route
            path={ROUTE_PATHS.routePatterns.studentSwapStep2}
            element={<StudentSwapStep2Page />}
          />
          <Route
            path={ROUTE_PATHS.student.requests}
            element={<StudentRequestsPage />}
          />
          <Route
            path={ROUTE_PATHS.routePatterns.studentRequestDetail}
            element={<StudentRequestsPage />}
          />
        </Route>
      </Route>

      <Route
        path={ROUTE_PATHS.routePatterns.confirmSwap}
        element={<ConfirmSwapPage />}
      />
      <Route path={ROUTE_PATHS.unauthorized} element={<UnauthorizedPage />} />
      <Route path={ROUTE_PATHS.notFound} element={<NotFoundPage />} />
      <Route path="/" element={<Navigate to={ROUTE_PATHS.login} replace />} />
      <Route
        path="*"
        element={<Navigate to={ROUTE_PATHS.notFound} replace />}
      />
    </Routes>
  );
}
