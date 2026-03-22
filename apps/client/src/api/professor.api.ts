import type { Course, SessionType, SwapRequest } from "@repo/types";
import type {
  ProfessorRequestQuery,
  RejectSwapRequestDto,
  ReportIssueDto,
} from "../types";
import { client } from "./client";
import { API_ENDPOINTS } from "../constants";

export const professorApi = {
  dashboard: {
    getStats: () =>
      client.get<{
        courses: number;
        students: number;
        pendingSwapRequests: number;
      }>(API_ENDPOINTS.professor.dashboardStats),
  },

  courses: {
    getAll: () => client.get<Course[]>(API_ENDPOINTS.professor.courses),
    getById: (id: string) =>
      client.get<{
        course: Course;
        groups: Array<{
          id: string;
          name: string;
          capacity: number;
          currentCount: number;
          isActive: boolean;
          sessionTypeId: string;
        }>;
        sessionTypes: SessionType[];
        students: Array<{
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          currentGroupId?: string;
          currentGroupName?: string;
          assignments: Array<{
            sessionTypeId: string;
            sessionKind?: SessionType["type"];
            groupId: string;
            groupName: string;
          }>;
        }>;
        stats: {
          totalStudents: number;
          groupsCount: number;
          pendingSwapRequests: number;
        };
      }>(API_ENDPOINTS.professor.courseById(id)),
    setSwapMode: (id: string, mode: { mode: Course["swapMode"] }) =>
      client.patch<Course>(API_ENDPOINTS.professor.courseSwapMode(id), mode),
    reportIssue: (id: string, dto: ReportIssueDto) =>
      client.post<{ message: string }>(
        API_ENDPOINTS.professor.courseReportIssue(id),
        dto,
      ),
  },

  requests: {
    getByCourse: (query: ProfessorRequestQuery) =>
      client.get<SwapRequest[]>(API_ENDPOINTS.professor.swapRequests, query),
    approve: (id: string) =>
      client.post<SwapRequest>(API_ENDPOINTS.swapRequests.approve(id)),
    reject: (id: string, dto: RejectSwapRequestDto) =>
      client.post<SwapRequest>(API_ENDPOINTS.swapRequests.reject(id), dto),
  },

  groups: {
    moveStudentToGroup: (studentId: string, groupId: string) =>
      client.post<{ success: boolean; message: string }>(
        API_ENDPOINTS.admin.moveStudentToGroup(studentId, groupId),
      ),
  },
};
