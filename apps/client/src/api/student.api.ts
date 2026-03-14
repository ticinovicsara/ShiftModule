import type { Course, SwapRequest } from "@repo/types";
import type { CreateSwapRequestDto } from "../types";
import { client } from "./client";
import { API_ENDPOINTS } from "../constants";

export const studentApi = {
  getCourses: () => client.get<Course[]>(API_ENDPOINTS.student.courses),
  getRequests: () => client.get<SwapRequest[]>(API_ENDPOINTS.student.requests),

  swapRequests: {
    getMy: () => client.get<SwapRequest[]>(API_ENDPOINTS.student.swapRequests),
    create: (dto: CreateSwapRequestDto) =>
      client.post<SwapRequest>(API_ENDPOINTS.student.swapRequests, dto),
    confirmPartner: (requestId: string) =>
      client.post<SwapRequest>(API_ENDPOINTS.student.confirmPartner(requestId)),
  },
};
