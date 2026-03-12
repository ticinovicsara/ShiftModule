export enum UserRole {
  ADMIN = "ADMIN",
  PROFESSOR = "PROFESSOR",
  STUDENT = "STUDENT",
}

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

export enum ActivityTypeKind {
  LECTURE = "LECTURE",
  LAB = "LAB",
  EXERCISE = "EXERCISE",
}

export interface Group {
  id: string;
  name: string;
  capacity: number;
  currentCount: number;
  isActive: boolean;
  activityTypeId: string;
}

export interface ActivityType {
  id: string;
  courseId: string;
  type: ActivityTypeKind;
}

export interface Course {
  id: string;
  title: string;
  studyMajorId: string;
}

export enum StudentGroupStatus {
  ASSIGNED = "ASSIGNED",
  UNASSIGNED = "UNASSIGNED",
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

export enum SwapRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  AUTO_RESOLVED = "AUTO_RESOLVED",
}

export interface SwapRequest {
  id: string;
  studentId: string;
  courseId: string;
  activityTypeId: string;
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
