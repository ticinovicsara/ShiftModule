import {
  SessionKind,
  StudentGroupStatus,
  SwapMode,
  SwapRequestStatus,
  UserRole,
} from "./enums";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
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
  courseId: string;
  sessionTypeId: string;
  currentGroupId: string;
  desiredGroupId: string;
  secondChoiceGroupId?: string;
  reason?: string;
  partnerEmail?: string;
  partnerConfirmed: boolean;
  status: SwapRequestStatus;
  priorityScore?: number;
  satisfiedWish?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiEnvelope<TData> {
  data: TData;
  error: string | Record<string, unknown> | null;
  message: string;
}
