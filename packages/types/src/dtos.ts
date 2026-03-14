import { ReportIssueReason, SessionKind, SwapMode, UserRole } from "./enums";
import { User } from "./models";

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseData {
  token: string;
  user: User;
}

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface CreateStudyMajorDto {
  title: string;
  year: number;
}

export interface UpdateStudyMajorDto {
  title?: string;
  year?: number;
}

export interface CreateCourseDto {
  title: string;
  studyMajorId: string;
}

export interface UpdateCourseDto {
  title?: string;
  studyMajorId?: string;
  professorId?: string;
  swapMode?: SwapMode;
}

export interface AssignProfessorDto {
  professorId: string;
}

export interface CreateGroupDto {
  name: string;
  capacity: number;
  activityTypeId: string;
}

export interface UpdateGroupDto {
  name?: string;
  capacity?: number;
  isActive?: boolean;
}

export interface UpdateGroupCapacityDto {
  capacity: number;
}

export interface ReportIssueDto {
  reason: ReportIssueReason;
  description?: string;
}

export interface CreateSessionTypeDto {
  courseId: string;
  type: SessionKind;
}

export interface UpdateSessionTypeDto {
  type?: SessionKind;
}

export interface CreateSwapRequestDto {
  courseId: string;
  activityTypeId: string;
  currentGroupId: string;
  desiredGroupId: string;
  secondChoiceGroupId?: string;
  reason?: string;
  partnerEmail?: string;
}

export interface RejectSwapRequestDto {
  reason?: string;
}

export interface ProfessorRequestQuery {
  courseId: string;
  mode: SwapMode;
}
