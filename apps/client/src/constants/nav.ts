import { UserRole } from "@repo/types";
import { LABELS } from "./labels";
import { ROUTE_PATHS } from "./paths";

export type NavigationViewport = "mobile" | "desktop";

export type NavigationIconName =
  | "home"
  | "dashboard"
  | "requests"
  | "groups"
  | "settings"
  | "courses"
  | "students"
  | "study-majors"
  | "schedule"
  | "notifications"
  | "profile"
  | "reports";

export interface NavigationItem {
  label: string;
  path: string;
  icon: NavigationIconName;
}

const unresolvedPath = ROUTE_PATHS.notFound;

export const NAVIGATION_CONFIG: Record<
  UserRole,
  Record<NavigationViewport, NavigationItem[]>
> = {
  [UserRole.ADMIN]: {
    mobile: [
      {
        label: LABELS.nav.home,
        path: ROUTE_PATHS.admin.dashboard,
        icon: "home",
      },
      { label: LABELS.nav.requests, path: unresolvedPath, icon: "requests" },
      {
        label: LABELS.nav.groups,
        path: ROUTE_PATHS.admin.groups,
        icon: "groups",
      },
      {
        label: "Swap potvrda",
        path: ROUTE_PATHS.confirmSwap("test"),
        icon: "requests",
      },
      {
        label: LABELS.nav.settings,
        path: ROUTE_PATHS.admin.settings,
        icon: "settings",
      },
    ],
    desktop: [
      {
        label: LABELS.nav.dashboard,
        path: ROUTE_PATHS.admin.dashboard,
        icon: "dashboard",
      },
      {
        label: LABELS.nav.courses,
        path: ROUTE_PATHS.admin.courses,
        icon: "courses",
      },
      {
        label: LABELS.nav.students,
        path: ROUTE_PATHS.admin.students,
        icon: "students",
      },
      { label: LABELS.nav.requests, path: unresolvedPath, icon: "requests" },
      {
        label: LABELS.nav.studyMajors,
        path: ROUTE_PATHS.admin.studyMajors,
        icon: "study-majors",
      },
      {
        label: "Swap potvrda",
        path: ROUTE_PATHS.confirmSwap("test"),
        icon: "requests",
      },
      {
        label: LABELS.nav.settings,
        path: ROUTE_PATHS.admin.settings,
        icon: "settings",
      },
    ],
  },
  [UserRole.PROFESSOR]: {
    mobile: [
      {
        label: LABELS.nav.courses,
        path: ROUTE_PATHS.professor.courses,
        icon: "courses",
      },
      { label: LABELS.nav.requests, path: unresolvedPath, icon: "requests" },
      { label: LABELS.nav.groups, path: unresolvedPath, icon: "groups" },
      { label: LABELS.nav.schedule, path: unresolvedPath, icon: "schedule" },
      {
        label: LABELS.nav.notifications,
        path: unresolvedPath,
        icon: "notifications",
      },
      { label: LABELS.nav.profile, path: unresolvedPath, icon: "profile" },
    ],
    desktop: [
      {
        label: LABELS.nav.dashboard,
        path: ROUTE_PATHS.professor.dashboard,
        icon: "dashboard",
      },
      {
        label: LABELS.nav.myCourses,
        path: ROUTE_PATHS.professor.courses,
        icon: "courses",
      },
      { label: LABELS.nav.students, path: unresolvedPath, icon: "students" },
      { label: LABELS.nav.schedule, path: unresolvedPath, icon: "schedule" },
      { label: LABELS.nav.reports, path: unresolvedPath, icon: "reports" },
      {
        label: LABELS.nav.settings,
        path: ROUTE_PATHS.professor.settings,
        icon: "settings",
      },
    ],
  },
  [UserRole.STUDENT]: {
    mobile: [
      {
        label: LABELS.nav.home,
        path: ROUTE_PATHS.student.courses,
        icon: "home",
      },
      {
        label: LABELS.nav.courses,
        path: ROUTE_PATHS.student.courses,
        icon: "courses",
      },
      {
        label: LABELS.nav.notifications,
        path: unresolvedPath,
        icon: "notifications",
      },
      { label: LABELS.nav.profile, path: unresolvedPath, icon: "profile" },
    ],
    desktop: [
      {
        label: LABELS.nav.home,
        path: ROUTE_PATHS.student.courses,
        icon: "home",
      },
      {
        label: LABELS.nav.courses,
        path: ROUTE_PATHS.student.courses,
        icon: "courses",
      },
      {
        label: LABELS.nav.notifications,
        path: unresolvedPath,
        icon: "notifications",
      },
      { label: LABELS.nav.profile, path: unresolvedPath, icon: "profile" },
    ],
  },
};
