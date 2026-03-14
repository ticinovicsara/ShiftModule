import type { CreateSessionTypeDto, SessionType } from "@repo/types";
import { useCallback, useMemo } from "react";
import { adminApi } from "../api";
import { useFetch } from "./useFetch";
import { useMutation } from "./useMutation";

export function useSessionTypes(courseId?: string) {
  const fetchAll = useCallback(() => {
    if (!courseId) {
      return adminApi.sessionTypes.getAll();
    }

    return adminApi.sessionTypes.getByCourse(courseId);
  }, [courseId]);

  const { data, loading, error, refetch } = useFetch<SessionType[]>(fetchAll, [
    fetchAll,
  ]);
  const createMutation = useMutation((dto: CreateSessionTypeDto) =>
    adminApi.sessionTypes.create(dto),
  );

  return useMemo(
    () => ({
      data,
      loading,
      error,
      refetch,
      create: createMutation.execute,
    }),
    [createMutation.execute, data, error, loading, refetch],
  );
}
