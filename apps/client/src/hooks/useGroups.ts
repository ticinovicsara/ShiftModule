import type {
  CreateGroupDto,
  Group,
  ReportIssueDto,
  UpdateGroupCapacityDto,
  UpdateGroupDto,
} from "@repo/types";
import { useCallback, useMemo } from "react";
import { adminApi, professorApi } from "../api";
import { useFetch } from "./useFetch";
import { useMutation } from "./useMutation";

export function useGroups() {
  const fetchAll = useCallback(() => adminApi.groups.getAll(), []);
  const { data, loading, error, refetch } = useFetch<Group[]>(fetchAll, [
    fetchAll,
  ]);

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
  const reportIssueMutation = useMutation(
    (args: { id: string; dto: ReportIssueDto }) =>
      professorApi.groups.reportIssue(args.id, args.dto),
  );
  const moveStudentMutation = useMutation(async () => {
    throw new Error("Move student endpoint is not available yet");
  });

  return useMemo(
    () => ({
      data,
      loading,
      error,
      refetch,
      create: createMutation.execute,
      update: updateMutation.execute,
      updateCapacity: updateCapacityMutation.execute,
      reportIssue: reportIssueMutation.execute,
      moveStudent: moveStudentMutation.execute,
    }),
    [
      createMutation.execute,
      data,
      error,
      loading,
      moveStudentMutation.execute,
      refetch,
      reportIssueMutation.execute,
      updateCapacityMutation.execute,
      updateMutation.execute,
    ],
  );
}
