import type {
  Course,
  Group,
  SessionKind,
  SessionType,
  StudyMajor,
  User,
} from "@repo/types";
import { UserRole } from "@repo/types";
import type {
  AssignProfessorDto,
  CreateCourseDto,
  CreateGroupDto,
  CreateSessionTypeDto,
  CreateStudyMajorDto,
  ReportIssueDto,
  UpdateCourseDto,
  UpdateGroupCapacityDto,
  UpdateGroupDto,
  UpdateSessionTypeDto,
  UpdateStudyMajorDto,
} from "../types";
import { client } from "./client";
import { API_ENDPOINTS } from "../constants";

interface ReportIssueResponse {
  message: string;
}

export const adminApi = {
  users: {
    getAll: () => client.get<User[]>(API_ENDPOINTS.admin.users),
    getByRole: (role: UserRole) =>
      client.get<User[]>(API_ENDPOINTS.admin.users, { role }),
    getStudents: () =>
      client.get<User[]>(API_ENDPOINTS.admin.usersByRole(UserRole.STUDENT)),
    getProfessors: () =>
      client.get<User[]>(API_ENDPOINTS.admin.usersByRole(UserRole.PROFESSOR)),
    getById: (id: string) => client.get<User>(API_ENDPOINTS.admin.userById(id)),
  },

  studyMajors: {
    getAll: () => client.get<StudyMajor[]>(API_ENDPOINTS.admin.studyMajors),
    getById: (id: string) =>
      client.get<StudyMajor>(API_ENDPOINTS.admin.studyMajorById(id)),
    create: (dto: CreateStudyMajorDto) =>
      client.post<StudyMajor>(API_ENDPOINTS.admin.studyMajors, dto),
    update: (id: string, dto: UpdateStudyMajorDto) =>
      client.patch<StudyMajor>(API_ENDPOINTS.admin.studyMajorById(id), dto),
    remove: (id: string) =>
      client.delete<StudyMajor>(API_ENDPOINTS.admin.studyMajorById(id)),
  },

  courses: {
    getAll: () => client.get<Course[]>(API_ENDPOINTS.admin.courses),
    getById: (id: string) =>
      client.get<{
        course: Course;
        groups: Group[];
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
      }>(API_ENDPOINTS.admin.courseById(id)),
    create: (dto: CreateCourseDto) =>
      client.post<Course>(API_ENDPOINTS.admin.courses, dto),
    update: (id: string, dto: UpdateCourseDto) =>
      client.patch<Course>(API_ENDPOINTS.admin.courseById(id), dto),
    assignProfessor: (id: string, dto: AssignProfessorDto) =>
      client.post<Course>(API_ENDPOINTS.admin.assignProfessor(id), dto),
    reportIssue: (id: string, dto: ReportIssueDto) =>
      client.post<ReportIssueResponse>(
        API_ENDPOINTS.professor.courseReportIssue(id),
        dto,
      ),
    remove: (id: string) =>
      client.delete<Course>(API_ENDPOINTS.admin.courseById(id)),
  },

  groups: {
    getAll: () => client.get<Group[]>(API_ENDPOINTS.admin.groups),
    create: (dto: CreateGroupDto) =>
      client.post<Group>(API_ENDPOINTS.admin.groups, dto),
    update: (id: string, dto: UpdateGroupDto) =>
      client.patch<Group>(API_ENDPOINTS.admin.groupById(id), dto),
    updateCapacity: (id: string, dto: UpdateGroupCapacityDto) =>
      client.patch<Group>(API_ENDPOINTS.admin.groupCapacity(id), dto),
    moveStudentToGroup: (studentId: string, groupId: string) =>
      client.post<{ success: boolean; message: string }>(
        API_ENDPOINTS.admin.moveStudentToGroup(studentId, groupId),
      ),
    remove: (id: string) =>
      client.delete<Group>(API_ENDPOINTS.admin.groupById(id)),
  },

  sessionTypes: {
    getAll: () => client.get<SessionType[]>(API_ENDPOINTS.admin.sessionTypes),
    getByCourse: (courseId: string) =>
      client.get<SessionType[]>(
        API_ENDPOINTS.admin.sessionTypesByCourse(courseId),
      ),
    create: (dto: CreateSessionTypeDto) =>
      client.post<SessionType>(API_ENDPOINTS.admin.sessionTypes, dto),
    update: (id: string, dto: UpdateSessionTypeDto) =>
      client.patch<SessionType>(API_ENDPOINTS.admin.sessionTypeById(id), dto),
    remove: (id: string) =>
      client.delete<SessionType>(API_ENDPOINTS.admin.sessionTypeById(id)),
  },

  studentManagement: {
    enrollWithoutGroup: (courseId: string, studentId: string) =>
      client.post<{
        alreadyEnrolled: boolean;
        enrollmentId: string;
        studentId: string;
        courseId: string;
      }>(API_ENDPOINTS.admin.enrollStudentWithoutGroup(courseId, studentId)),
    autoAssignUngrouped: (courseId: string, sessionKind?: SessionKind) =>
      client.post<{
        courseId: string;
        sessionKind: SessionKind | null;
        createdAssignments: number;
        skippedExisting: number;
        unresolved: number;
      }>(
        API_ENDPOINTS.admin.autoAssignUngroupedStudents(courseId),
        {},
        sessionKind ? { params: { sessionKind } } : undefined,
      ),
    importExistingStudentsToCourse: (
      courseId: string,
      payload: Record<string, unknown> | unknown[],
    ) =>
      client.post<{
        courseId: string;
        processed: number;
        enrolledCount: number;
        alreadyEnrolledCount: number;
        notFoundCount: number;
        notStudentCount: number;
        results: Array<{
          email?: string;
          status: string;
          studentId?: string;
        }>;
      }>(API_ENDPOINTS.admin.importStudentsToCourse(courseId), payload),
  },
};
