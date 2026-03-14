import type { CreateUserDto, User } from "@repo/types";
import { useCallback, useMemo } from "react";
import { adminApi } from "../api";
import { useFetch } from "./useFetch";
import { useMutation } from "./useMutation";

export function useStudents() {
  const fetchAll = useCallback(() => adminApi.users.getStudents(), []);
  const { data, loading, error, refetch } = useFetch<User[]>(fetchAll, [
    fetchAll,
  ]);

  const importMutation = useMutation((rows: CreateUserDto[]) =>
    adminApi.users.importMany(rows),
  );
  const enrollMutation = useMutation(async () => {
    throw new Error("Enroll endpoint is not available yet");
  });

  return useMemo(
    () => ({
      data,
      loading,
      error,
      refetch,
      importStudents: importMutation.execute,
      enroll: enrollMutation.execute,
    }),
    [
      data,
      enrollMutation.execute,
      error,
      importMutation.execute,
      loading,
      refetch,
    ],
  );
}
