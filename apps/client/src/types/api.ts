export type {
  ApiEnvelope,
  AssignProfessorDto,
  Course,
  CreateCourseDto,
  CreateGroupDto,
  CreateSessionTypeDto,
  CreateStudyMajorDto,
  CreateSwapRequestDto,
  CreateUserDto,
  Group,
  LoginRequestDto,
  LoginResponseData,
  ProfessorRequestQuery,
  RejectSwapRequestDto,
  ReportIssueDto,
  SessionType,
  StudyMajor,
  SwapRequest,
  UpdateCourseDto,
  UpdateGroupCapacityDto,
  UpdateGroupDto,
  UpdateSessionTypeDto,
  UpdateStudyMajorDto,
  UpdateUserDto,
  User,
} from "@repo/types";

import type {
  Course,
  Group,
  SessionType,
  StudyMajor,
  SwapRequest,
  User,
} from "@repo/types";

export interface AdminApiContract {
  users: User[];
  studyMajors: StudyMajor[];
  courses: Course[];
  groups: Group[];
  sessionTypes: SessionType[];
  swapRequests: SwapRequest[];
}
