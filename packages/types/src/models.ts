import {
  SessionKind,
  StudentSwapViewState,
  StudentGroupStatus,
  SwapMode,
  SwapRequestStatus,
  SwapRequestType,
  UserRole,
} from "./enums";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  gpa?: number;
}

export interface StudyMajor {
  id: string;
  title: string;
  year: number;
}

export interface Group {
  id: string;
  name: string;
  capacity: number;
  currentCount: number;
  isActive: boolean;
  sessionTypeId: string;
  schedule?: {
    day: string;
    time: string;
    room: string;
  };
}

export interface SessionType {
  id: string;
  courseId: string;
  type: SessionKind;
}

export interface Course {
  id: string;
  title: string;
  professorId?: string;
  studyMajorId: string;
  merlinUrl?: string;
  swapMode?: SwapMode;
}

export interface StudentGroup {
  id: string;
  studentId: string;
  groupId: string;
  status: StudentGroupStatus;
}

export interface StudentCourse {
  id: string;
  studentId: string;
  courseId: string;
}

export interface SwapRequest {
  id: string;
  studentId: string;
  partnerStudentId?: string;
  courseId: string;
  sessionTypeId: string;
  currentGroupId: string;
  desiredGroupId: string;
  secondChoiceGroupId?: string;
  requestType: SwapRequestType;
  reason?: string;
  partnerEmail?: string;
  partnerConfirmed: boolean;
  status: SwapRequestStatus;
  processingMode?: "MANUAL" | "AUTOMATIC";
  courseTitle?: string;
  currentGroupName?: string;
  desiredGroupName?: string;
  isIncomingPartnerRequest?: boolean;
  studentViewState?: StudentSwapViewState;
  priorityScore?: number;
  satisfiedWish?: boolean;
  matchDeadline?: Date;
  createdAt: Date;
  updatedAt: Date;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    gpa?: number;
  };
}

export interface SwapRequestWithUsers extends SwapRequest {
  student?: Pick<User, "id" | "firstName" | "lastName" | "email" | "gpa">;
  partner?: Pick<User, "id" | "firstName" | "lastName" | "email" | "gpa">;
}

export interface ApiEnvelope<TData> {
  data: TData;
  error: string | Record<string, unknown> | null;
  message: string;
}
