import type {
  Course,
  Group,
  SessionKind,
  SessionType,
  SwapRequest,
  SwapRequestStatus,
} from "@repo/types";
import type { CreateSwapRequestDto } from "../types";
import { client } from "./client";
import { API_ENDPOINTS } from "../constants";

export const studentApi = {
  getCourses: () => client.get<Course[]>(API_ENDPOINTS.student.courses),
  getMyEnrollments: () =>
    client.get<
      Array<{
        id: string;
        studentId: string;
        courseId: string;
        course: Course | null;
        groups: Array<{ id: string; studentId: string; groupId: string }>;
        activeRequest: SwapRequest | null;
      }>
    >(API_ENDPOINTS.student.courses),
  getCourseOverviews: () =>
    client.get<
      Array<{
        course: Course | null;
        currentGroup: Group | null;
        latestRequestStatus?: SwapRequestStatus;
        hasPendingRequest: boolean;
      }>
    >(API_ENDPOINTS.student.courseOverviews),
  getCourseById: (id: string) =>
    client.get<{
      course: Course | null;
      sessionTypes: SessionType[];
      currentGroup: Group | null;
      currentGroups: Group[];
      groups: Array<Group & { sessionKind: SessionKind }>;
      hasPendingRequest: boolean;
    }>(API_ENDPOINTS.student.courseById(id)),
  getRequests: () => client.get<SwapRequest[]>(API_ENDPOINTS.student.requests),

  swapRequests: {
    getMy: () => client.get<SwapRequest[]>(API_ENDPOINTS.student.swapRequests),
    create: (dto: CreateSwapRequestDto) =>
      client.post<SwapRequest>(API_ENDPOINTS.student.swapRequests, dto),
    confirmPartner: (requestId: string) =>
      client.post<SwapRequest>(API_ENDPOINTS.student.confirmPartner(requestId)),
  },
};
