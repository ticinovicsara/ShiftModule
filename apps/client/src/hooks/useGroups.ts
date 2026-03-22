import type {
  CreateGroupDto,
  Group,
  UpdateGroupCapacityDto,
  UpdateGroupDto,
} from "@repo/types";
import { UserRole as Role } from "@repo/types";
import { useCallback, useContext, useMemo } from "react";
import { adminApi } from "../api";
import { AuthContext } from "../context/AuthContext";
import { useFetch } from "./useFetch";
import { useMutation } from "./useMutation";

export function useGroups() {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error("useGroups must be used within AuthProvider");
  }

  const fetchAll = useCallback(async () => {
    if (auth.role !== Role.ADMIN && auth.role !== Role.PROFESSOR) {
      return [] as Group[];
    }

    return adminApi.groups.getAll();
  }, [auth.role]);
  const { data, loading, error, refetch } = useFetch<Group[]>(fetchAll);

  const createMutation = useMutation((dto: CreateGroupDto) =>
    adminApi.groups.create(dto),
  );
  const updateMutation = useMutation(
    (args: { id: string; dto: UpdateGroupDto }) =>
      adminApi.groups.update(args.id, args.dto),
  );
  const updateCapacityMutation = useMutation(
    (args: { id: string; dto: UpdateGroupCapacityDto }) =>
      adminApi.groups.updateCapacity(args.id, args.dto),
  );
  const moveStudentMutation = useMutation(
    (args: { studentId: string; groupId: string }) =>
      adminApi.groups.moveStudentToGroup(args.studentId, args.groupId),
  );

  return useMemo(
    () => ({
      data,
      loading,
      error,
      refetch,
      create: createMutation.execute,
      update: updateMutation.execute,
      updateCapacity: updateCapacityMutation.execute,
      moveStudent: moveStudentMutation.execute,
    }),
    [
      createMutation.execute,
      data,
      error,
      loading,
      moveStudentMutation.execute,
      refetch,
      updateCapacityMutation.execute,
      updateMutation.execute,
    ],
  );
}
