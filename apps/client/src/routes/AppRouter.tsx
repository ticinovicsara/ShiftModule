import { UserRole } from "@repo/types";
import { Routes, Route, Navigate } from "react-router-dom";
import { ROUTE_PATHS } from "../constants";
import { AppLayout } from "../layouts/AppLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import {
  LoginPage,
  AdminDashboardPage,
  AdminStudentsPage,
  AdminImportPage,
  AdminCoursesPage,
  AdminCourseDetailPage,
  ProfessorCoursesPage,
  ProfessorCourseDetailPage,
  ProfessorRequestDetailPage,
  ProfessorAutoLogPage,
  StudentCoursesPage,
  StudentCourseDetailPage,
  StudentSwapStep1Page,
  StudentSwapStep2Page,
  StudentRequestsPage,
  ConfirmSwapPage,
  UnauthorizedPage,
  NotFoundPage,
} from "../pages";
import { SettingsPage } from "../pages/shared/SettingsPage";
import { ProtectedRoute } from "./ProtectedRoute";

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
          <Route path={ROUTE_PATHS.admin.settings} element={<SettingsPage />} />
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
          <Route
            path={ROUTE_PATHS.professor.settings}
            element={<SettingsPage />}
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
          <Route
            path={ROUTE_PATHS.student.settings}
            element={<SettingsPage />}
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
