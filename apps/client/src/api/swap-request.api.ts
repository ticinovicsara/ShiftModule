import type { SwapRequest } from "@repo/types";
import type {
  CreateSwapRequestDto,
  ProfessorRequestQuery,
  RejectSwapRequestDto,
} from "../types";
import { API_ENDPOINTS } from "../constants";
import { client } from "./client";

export const swapRequestApi = {
  student: {
    getAll: () => client.get<SwapRequest[]>(API_ENDPOINTS.student.swapRequests),
    create: (dto: CreateSwapRequestDto) =>
      client.post<SwapRequest>(API_ENDPOINTS.student.swapRequests, dto),
    confirmPartner: (requestId: string) =>
      client.post<SwapRequest>(API_ENDPOINTS.student.confirmPartner(requestId)),
  },
  professor: {
    getByCourse: (query: ProfessorRequestQuery) =>
      client.get<SwapRequest[]>(API_ENDPOINTS.professor.swapRequests, query),
    approve: (requestId: string) =>
      client.post<SwapRequest>(
        API_ENDPOINTS.professor.approveSwapRequest(requestId),
      ),
    reject: (requestId: string, dto: RejectSwapRequestDto) =>
      client.post<SwapRequest>(
        API_ENDPOINTS.professor.rejectSwapRequest(requestId),
        dto,
      ),
  },
};
