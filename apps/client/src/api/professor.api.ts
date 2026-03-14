import type { Course, SwapRequest } from "@repo/types";
import type {
  ProfessorRequestQuery,
  RejectSwapRequestDto,
  ReportIssueDto,
} from "../types";
import { client } from "./client";
import { API_ENDPOINTS } from "../constants";

export const professorApi = {
  courses: {
    getAll: () =>
      client.get<Course | Course[]>(API_ENDPOINTS.professor.courses),
    getById: (id: string) =>
      client.get<Course>(API_ENDPOINTS.professor.courseById(id)),
    setSwapMode: (id: string, mode: { mode: Course["swapMode"] }) =>
      client.patch<Course>(API_ENDPOINTS.professor.courseSwapMode(id), mode),
  },

  requests: {
    getByCourse: (query: ProfessorRequestQuery) =>
      client.get<SwapRequest[]>(API_ENDPOINTS.professor.swapRequests, query),
    approve: (id: string) =>
      client.post<SwapRequest>(API_ENDPOINTS.professor.approveSwapRequest(id)),
    reject: (id: string, dto: RejectSwapRequestDto) =>
      client.post<SwapRequest>(
        API_ENDPOINTS.professor.rejectSwapRequest(id),
        dto,
      ),
  },

  groups: {
    reportIssue: (id: string, dto: ReportIssueDto) =>
      client.post<{ message: string }>(
        API_ENDPOINTS.professor.reportIssue(id),
        dto,
      ),
  },
};
