import type { Course, Group, SessionType, StudyMajor, User } from "@repo/types";
import type {
  AssignProfessorDto,
  CreateCourseDto,
  CreateGroupDto,
  CreateSessionTypeDto,
  CreateStudyMajorDto,
  CreateUserDto,
  ReportIssueDto,
  UpdateCourseDto,
  UpdateGroupCapacityDto,
  UpdateGroupDto,
  UpdateSessionTypeDto,
  UpdateStudyMajorDto,
  UpdateUserDto,
} from "../types";
import { client } from "./client";
import { API_ENDPOINTS } from "./endpoints";

interface ReportIssueResponse {
  message: string;
}

export const adminApi = {
  users: {
    getAll: () => client.get<User[]>(API_ENDPOINTS.admin.users),
    getStudents: () => client.get<User[]>(API_ENDPOINTS.admin.usersStudents),
    getProfessors: () =>
      client.get<User[]>(API_ENDPOINTS.admin.usersProfessors),
    getById: (id: string) => client.get<User>(API_ENDPOINTS.admin.userById(id)),
    create: (dto: CreateUserDto) =>
      client.post<User>(API_ENDPOINTS.admin.users, dto),
    importMany: (rows: CreateUserDto[]) =>
      client.post<User[]>(API_ENDPOINTS.admin.usersImport, rows),
    update: (id: string, dto: UpdateUserDto) =>
      client.patch<User>(API_ENDPOINTS.admin.userById(id), dto),
    remove: (id: string) =>
      client.delete<User>(API_ENDPOINTS.admin.userById(id)),
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
    create: (dto: CreateCourseDto) =>
      client.post<Course>(API_ENDPOINTS.admin.courses, dto),
    update: (id: string, dto: UpdateCourseDto) =>
      client.patch<Course>(API_ENDPOINTS.admin.courseById(id), dto),
    assignProfessor: (id: string, dto: AssignProfessorDto) =>
      client.post<Course>(API_ENDPOINTS.admin.assignProfessor(id), dto),
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
    remove: (id: string) =>
      client.delete<Group>(API_ENDPOINTS.admin.groupById(id)),
    reportIssue: (id: string, dto: ReportIssueDto) =>
      client.post<ReportIssueResponse>(
        API_ENDPOINTS.professor.reportIssue(id),
        dto,
      ),
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
};
