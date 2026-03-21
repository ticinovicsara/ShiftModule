import type {
  CreateSwapRequestDto,
  RejectSwapRequestDto,
  SwapRequest,
  UserRole,
} from "@repo/types";
import { UserRole as Role, SwapMode } from "@repo/types";
import { useCallback, useContext, useMemo } from "react";
import { swapRequestApi } from "../api";
import { AuthContext } from "../context/AuthContext";
import { useFetch } from "./useFetch";
import { useMutation } from "./useMutation";

async function fetchByRole(role: UserRole | null) {
  if (role === Role.ADMIN) {
    return swapRequestApi.admin.getAll();
  }

  if (role === Role.PROFESSOR) {
    const [manual, automatic] = await Promise.all([
      swapRequestApi.professor.getByCourse({
        mode: SwapMode.MANUAL,
      }),
      swapRequestApi.professor.getByCourse({
        mode: SwapMode.AUTO,
      }),
    ]);

    const merged = new Map<string, SwapRequest>();
    [...manual, ...automatic].forEach((request) => {
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
  const { data, loading, error, refetch } = useFetch<SwapRequest[]>(fetchAll, [
    fetchAll,
  ]);

  const createMutation = useMutation((dto: CreateSwapRequestDto) =>
    swapRequestApi.student.create(dto),
  );
  const approveMutation = useMutation((id: string) =>
    swapRequestApi.professor.approve(id),
  );
  const rejectMutation = useMutation(
    (args: { id: string; dto: RejectSwapRequestDto }) =>
      swapRequestApi.professor.reject(args.id, args.dto),
  );
  const confirmPartnerMutation = useMutation((id: string) =>
    swapRequestApi.student.confirmPartner(id),
  );

  return useMemo(
    () => ({
      data,
      loading,
      error,
      refetch,
      create: createMutation.execute,
      approve: approveMutation.execute,
      reject: rejectMutation.execute,
      confirmPartner: confirmPartnerMutation.execute,
    }),
    [
      approveMutation.execute,
      confirmPartnerMutation.execute,
      createMutation.execute,
      data,
      error,
      loading,
      refetch,
      rejectMutation.execute,
    ],
  );
}
