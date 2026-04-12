import {
  SessionKind,
  SwapRequest,
  SwapRequestStatus,
  SwapRequestType,
  UserRole,
} from '@repo/types';

type EnrollmentLike = { courseId: string };

type GroupLike = {
  id: string;
  sessionTypeId: string;
};

type SessionTypeLike = {
  courseId: string;
  type: SessionKind;
};

type UserLike = {
  id: string;
  email: string;
  role: UserRole;
};

export function isStudentEnrolledInCourse(
  enrollments: EnrollmentLike[],
  courseId: string,
): boolean {
  return enrollments.some((enrollment) => enrollment.courseId === courseId);
}

export function hasPendingRequestForSession(
  requests: SwapRequest[],
  courseId: string,
  sessionTypeId: string,
): boolean {
  return requests.some(
    (request) =>
      request.courseId === courseId &&
      request.sessionTypeId === sessionTypeId &&
      (request.status === SwapRequestStatus.PENDING ||
        request.status === SwapRequestStatus.WAITING_FOR_MATCH),
  );
}

export function countRejectedAttemptsForSession(
  requests: SwapRequest[],
  sessionTypeId: string,
): number {
  return requests.filter(
    (request) =>
      request.sessionTypeId === sessionTypeId &&
      request.status === SwapRequestStatus.REJECTED,
  ).length;
}

export function areSessionTypesFromCourse(
  currentSessionType: SessionTypeLike,
  desiredSessionType: SessionTypeLike,
  courseId: string,
): boolean {
  return (
    currentSessionType.courseId === courseId &&
    desiredSessionType.courseId === courseId
  );
}

export function areSessionKindsCompatible(
  currentSessionType: SessionTypeLike,
  desiredSessionType: SessionTypeLike,
): boolean {
  return currentSessionType.type === desiredSessionType.type;
}

export function isGroupCompatibleWithSessionType(
  group: GroupLike,
  sessionTypeId: string,
): boolean {
  return group.sessionTypeId === sessionTypeId;
}

export function isValidPairedPartner(
  requesterEmail: string,
  partnerEmail: string,
  partner: UserLike | null | undefined,
  partnerEnrollments: EnrollmentLike[],
  courseId: string,
): boolean {
  if (!partner || partner.role !== UserRole.STUDENT) {
    return false;
  }

  if (
    requesterEmail.trim().toLowerCase() === partnerEmail.trim().toLowerCase()
  ) {
    return false;
  }

  return partnerEnrollments.some(
    (enrollment) => enrollment.courseId === courseId,
  );
}

export function deriveRequestType(
  explicitRequestType: SwapRequestType | undefined,
  partnerEmail?: string,
): SwapRequestType {
  return (
    explicitRequestType ??
    (partnerEmail ? SwapRequestType.PAIRED : SwapRequestType.SOLO)
  );
}
