import type { CreateUserDto, User } from "@repo/types";
import { UserRole } from "@repo/types";
import { useCallback, useContext, useMemo } from "react";
import { adminApi } from "../api";
import { AuthContext } from "../context/AuthContext";
import { useFetch } from "./useFetch";
import { useMutation } from "./useMutation";

export function useStudents() {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error("useStudents must be used within AuthProvider");
  }

  const fetchAll = useCallback(async () => {
    if (auth.role !== UserRole.ADMIN) {
      return [] as User[];
    }

    return adminApi.users.getStudents();
  }, [auth.role]);
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
