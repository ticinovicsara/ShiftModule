import { SwapRequestStatus } from "@repo/types";
import { useCallback, useMemo } from "react";
import { professorApi } from "../api";
import { useFetch } from "./useFetch";

interface ProfessorDashboardStats {
  courses: number;
  students: number;
  pendingSwapRequests: number;
}

export function useProfessorDashboardStats() {
  const fetchStats = useCallback(async (): Promise<ProfessorDashboardStats> => {
    const stats = await professorApi.dashboard.getStats();

    return {
      courses: stats.courses,
      students: stats.students,
      pendingSwapRequests: stats.pendingSwapRequests,
    };
  }, []);

  const { data, loading, error, refetch } = useFetch(fetchStats);

  const metrics = useMemo(
    () => [
      { key: "courses", value: data?.courses ?? 0 },
      { key: "students", value: data?.students ?? 0 },
      {
        key: "pendingSwapRequests",
        value: data?.pendingSwapRequests ?? 0,
        status: SwapRequestStatus.PENDING,
      },
    ],
    [data],
  );

  return { data, loading, error, metrics, refetch };
}
