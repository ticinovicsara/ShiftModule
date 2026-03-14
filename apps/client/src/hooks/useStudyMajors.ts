import type { CreateStudyMajorDto, StudyMajor } from "@repo/types";
import { useCallback, useMemo } from "react";
import { adminApi } from "../api";
import { useFetch } from "./useFetch";
import { useMutation } from "./useMutation";

export function useStudyMajors() {
  const fetchAll = useCallback(() => adminApi.studyMajors.getAll(), []);
  const { data, loading, error, refetch } = useFetch<StudyMajor[]>(fetchAll, [
    fetchAll,
  ]);

  const createMutation = useMutation((dto: CreateStudyMajorDto) =>
    adminApi.studyMajors.create(dto),
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
