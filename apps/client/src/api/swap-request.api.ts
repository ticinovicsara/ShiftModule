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
  },
};
