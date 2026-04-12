import type {
  CreateSwapRequestDto,
  RejectSwapRequestDto,
  SwapRequest,
  UserRole,
} from "@repo/types";
import { UserRole as Role } from "@repo/types";
import { useCallback, useContext, useMemo } from "react";
import { professorApi, swapRequestApi } from "../api";
import { AuthContext } from "../context/AuthContext";
import { useFetch } from "./useFetch";
import { useMutation } from "./useMutation";

async function fetchByRole(role: UserRole | null) {
  if (role === Role.ADMIN) {
    return swapRequestApi.admin.getAll();
  }

  if (role === Role.PROFESSOR) {
    const merged = new Map<string, SwapRequest>();

    const courses = await professorApi.courses.getAll();
    const courseIds = courses.map((course) => course.id);

    const courseDetails = await Promise.all(
      courseIds.map(async (courseId) => {
        try {
          const detail = await professorApi.courses.getById(courseId);
          return {
            courseId,
            sessionTypeIds: detail.sessionTypes.map(
              (sessionType) => sessionType.id,
            ),
          };
        } catch {
          return {
            courseId,
            sessionTypeIds: [] as string[],
          };
        }
      }),
    );

    const queries = courseDetails.flatMap((detail) =>
      detail.sessionTypeIds.map((sessionTypeId) => ({
        courseId: detail.courseId,
        sessionTypeId,
      })),
    );

    if (!queries.length) {
      return [];
    }

    const requestBatches = await Promise.all(
      queries.map(async (query) => {
        try {
          return await swapRequestApi.professor.getByCourse(query);
        } catch {
          return [] as SwapRequest[];
        }
      }),
    );

    requestBatches.flat().forEach((request) => {
      merged.set(request.id, request);
    });

    return Array.from(merged.values());
  }

  return swapRequestApi.student.getAll();
}

export function useSwapRequests() {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error("useSwapRequests must be used within AuthProvider");
  }

  const { role } = auth;

  const fetchAll = useCallback(() => fetchByRole(role), [role]);
  const { data, loading, error, refetch } = useFetch<SwapRequest[]>(fetchAll);

  const createMutation = useMutation((dto: CreateSwapRequestDto) =>
    swapRequestApi.student.create(dto),
  );
  const updateMutation = useMutation(
    (args: { id: string; dto: Partial<CreateSwapRequestDto> }) =>
      swapRequestApi.student.update(args.id, args.dto),
  );
  const approveMutation = useMutation((id: string) =>
    swapRequestApi.requests.approve(id),
  );
  const rejectMutation = useMutation(
    (args: { id: string; dto: RejectSwapRequestDto }) =>
      swapRequestApi.requests.reject(args.id, args.dto),
  );
  const bulkApproveMutation = useMutation((ids: string[]) =>
    swapRequestApi.requests.bulkApprove(ids),
  );
  const bulkRejectMutation = useMutation(
    (args: { ids: string[]; dto: RejectSwapRequestDto }) =>
      swapRequestApi.requests.bulkReject(args.ids, args.dto),
  );
  const confirmPartnerMutation = useMutation((id: string) =>
    swapRequestApi.student.confirmPartner(id),
  );
  const declinePartnerMutation = useMutation((id: string) =>
    swapRequestApi.student.declinePartner(id),
  );
  const cancelMutation = useMutation((id: string) =>
    swapRequestApi.student.cancel(id),
  );

  return useMemo(
    () => ({
      data,
      loading,
      error,
      refetch,
      create: createMutation.execute,
      update: updateMutation.execute,
      approve: approveMutation.execute,
      reject: rejectMutation.execute,
      confirmPartner: confirmPartnerMutation.execute,
      declinePartner: declinePartnerMutation.execute,
      cancel: cancelMutation.execute,
      approveAll: bulkApproveMutation.execute,
      rejectAll: bulkRejectMutation.execute,
    }),
    [
      approveMutation.execute,
      bulkApproveMutation.execute,
      bulkRejectMutation.execute,
      cancelMutation.execute,
      confirmPartnerMutation.execute,
      declinePartnerMutation.execute,
      createMutation.execute,
      data,
      error,
      loading,
      refetch,
      rejectMutation.execute,
      updateMutation.execute,
    ],
  );
}
