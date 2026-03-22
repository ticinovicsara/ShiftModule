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

const studentNavigationItems: NavigationItem[] = [
  {
    label: LABELS.nav.courses,
    path: ROUTE_PATHS.student.courses,
    icon: "courses",
  },
  {
    label: LABELS.nav.notifications,
    path: ROUTE_PATHS.student.notifications,
    icon: "notifications",
  },
  {
    label: LABELS.nav.settings,
    path: ROUTE_PATHS.student.settings,
    icon: "settings",
  },
];

const studentDesktopNavigationItems: NavigationItem[] = [
  ...studentNavigationItems,
  {
    label: "Merlin",
    path: "https://merlin.srce.hr",
    icon: "courses",
  },
];

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
      {
        label: LABELS.nav.requests,
        path: ROUTE_PATHS.admin.requests,
        icon: "requests",
      },
      {
        label: LABELS.nav.courses,
        path: ROUTE_PATHS.admin.courses,
        icon: "courses",
      },
      {
        label: LABELS.nav.groups,
        path: ROUTE_PATHS.admin.groups,
        icon: "groups",
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
        label: LABELS.nav.students,
        path: ROUTE_PATHS.admin.students,
        icon: "students",
      },
      {
        label: LABELS.nav.requests,
        path: ROUTE_PATHS.admin.requests,
        icon: "requests",
      },
      {
        label: LABELS.nav.courses,
        path: ROUTE_PATHS.admin.courses,
        icon: "courses",
      },
      {
        label: LABELS.nav.settings,
        path: ROUTE_PATHS.admin.settings,
        icon: "settings",
      },
      {
        label: "Merlin",
        path: "https://merlin.srce.hr",
        icon: "courses",
      },
    ],
  },
  [UserRole.PROFESSOR]: {
    mobile: [
      {
        label: LABELS.nav.requests,
        path: ROUTE_PATHS.professor.requests,
        icon: "requests",
      },
      {
        label: LABELS.nav.groups,
        path: ROUTE_PATHS.professor.courses,
        icon: "groups",
      },
    ],
    desktop: [
      {
        label: LABELS.nav.dashboard,
        path: ROUTE_PATHS.professor.dashboard,
        icon: "dashboard",
      },
      {
        label: LABELS.nav.requests,
        path: ROUTE_PATHS.professor.requests,
        icon: "requests",
      },
      {
        label: LABELS.nav.groups,
        path: ROUTE_PATHS.professor.courses,
        icon: "groups",
      },
      {
        label: LABELS.nav.settings,
        path: ROUTE_PATHS.professor.settings,
        icon: "settings",
      },
      {
        label: "Merlin",
        path: "https://merlin.srce.hr",
        icon: "courses",
      },
    ],
  },
  [UserRole.STUDENT]: {
    mobile: studentNavigationItems,
    desktop: studentDesktopNavigationItems,
  },
};
