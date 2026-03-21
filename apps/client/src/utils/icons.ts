import type { ComponentType } from "react";
import {
  FaHouse,
  FaChartLine,
  FaArrowRightArrowLeft,
  FaUsers,
  FaGear,
  FaBook,
  FaChalkboardUser,
  FaGraduationCap,
  FaCalendar,
  FaBell,
  FaUser,
  FaFileLines,
} from "react-icons/fa6";
import type { NavigationIconName } from "../constants";

type IconComponent = ComponentType<{ className?: string }>;

export const iconMap: Record<NavigationIconName, IconComponent> = {
  home: FaHouse,
  dashboard: FaChartLine,
  requests: FaArrowRightArrowLeft,
  groups: FaUsers,
  settings: FaGear,
  courses: FaBook,
  students: FaChalkboardUser,
  "study-majors": FaGraduationCap,
  schedule: FaCalendar,
  notifications: FaBell,
  profile: FaUser,
  reports: FaFileLines,
};

export function getIcon(iconName: NavigationIconName): IconComponent {
  return iconMap[iconName] || FaHouse;
}
