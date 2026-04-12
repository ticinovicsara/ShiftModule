import type { SwapRequest } from "@repo/types";
import type {
  CreateSwapRequestDto,
  ProfessorRequestQuery,
  RejectSwapRequestDto,
} from "../types";
import { API_ENDPOINTS } from "../constants";
import { client } from "./client";

export const swapRequestApi = {
  admin: {
    getAll: () => client.get<SwapRequest[]>(API_ENDPOINTS.admin.swapRequests),
  },
  student: {
    getAll: () => client.get<SwapRequest[]>(API_ENDPOINTS.student.swapRequests),
    create: (dto: CreateSwapRequestDto) =>
      client.post<SwapRequest>(API_ENDPOINTS.student.swapRequests, dto),
    update: (requestId: string, dto: Partial<CreateSwapRequestDto>) => {
      if (!requestId) {
        throw new Error("Swap request id is required for update");
      }

      return client.post<SwapRequest>(
        API_ENDPOINTS.student.updateSwapRequest(requestId),
        dto,
      );
    },
    cancel: (requestId: string) =>
      client.delete<SwapRequest>(
        API_ENDPOINTS.student.cancelSwapRequest(requestId),
      ),
    confirmPartner: (requestId: string) =>
      client.post<SwapRequest>(API_ENDPOINTS.student.confirmPartner(requestId)),
    declinePartner: (requestId: string) =>
      client.post<SwapRequest>(API_ENDPOINTS.student.declinePartner(requestId)),
  },
  professor: {
    getByCourse: (query: ProfessorRequestQuery) =>
      client.get<SwapRequest[]>(API_ENDPOINTS.professor.swapRequests, query),
  },
  requests: {
    approve: (requestId: string) =>
      client.post<SwapRequest>(API_ENDPOINTS.swapRequests.approve(requestId)),
    reject: (requestId: string, dto: RejectSwapRequestDto) =>
      client.post<SwapRequest>(
        API_ENDPOINTS.swapRequests.reject(requestId),
        dto,
      ),
    bulkApprove: (ids: string[]) =>
      client.post<{
        total: number;
        approved: number;
        skipped: number;
        results: Array<{
          id: string;
          status: "approved" | "skipped";
          message?: string;
        }>;
      }>(API_ENDPOINTS.swapRequests.bulkApprove, { ids }),
    bulkReject: (ids: string[], dto: RejectSwapRequestDto) =>
      client.post<{
        total: number;
        rejected: number;
        skipped: number;
        results: Array<{
          id: string;
          status: "rejected" | "skipped";
          message?: string;
        }>;
      }>(API_ENDPOINTS.swapRequests.bulkReject, { ids, reason: dto.reason }),
  },
};
