import { useCallback, useMemo } from "react";
import { adminApi, swapRequestApi } from "../api";
import { useFetch } from "./useFetch";

export interface DashboardStats {
  students: number;
  courses: number;
  groups: number;
  swapRequests: number;
}

export function useDashboardStats() {
  const fetchStats = useCallback(async (): Promise<DashboardStats> => {
    const [students, courses, groups, swapRequests] = await Promise.all([
      adminApi.users.getStudents(),
      adminApi.courses.getAll(),
      adminApi.groups.getAll(),
      swapRequestApi.admin.getAll(),
    ]);

    return {
      students: students.length,
      courses: courses.length,
      groups: groups.length,
      swapRequests: swapRequests.length,
    };
  }, []);

  const { data, loading, error, refetch } =
    useFetch<DashboardStats>(fetchStats);

  const metrics = useMemo(
    () => [
      { key: "students", value: data?.students ?? 0 },
      { key: "courses", value: data?.courses ?? 0 },
      { key: "groups", value: data?.groups ?? 0 },
      { key: "swapRequests", value: data?.swapRequests ?? 0 },
    ],
    [data],
  );

  return { data, metrics, loading, error, refetch };
}
