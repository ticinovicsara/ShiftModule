import { SwapRequest, SwapRequestStatus, SwapRequestType } from '@repo/types';

type RequestLike = Pick<
  SwapRequest,
  | 'id'
  | 'studentId'
  | 'courseId'
  | 'sessionTypeId'
  | 'currentGroupId'
  | 'desiredGroupId'
  | 'status'
  | 'requestType'
  | 'partnerConfirmed'
  | 'partnerEmail'
>;

export function isPairedRequest(request: Pick<RequestLike, 'requestType'>) {
  return request.requestType === SwapRequestType.PAIRED;
}

export function areReciprocalRequests(
  left: RequestLike,
  right: RequestLike,
): boolean {
  return (
    left.id !== right.id &&
    left.studentId !== right.studentId &&
    left.courseId === right.courseId &&
    left.sessionTypeId === right.sessionTypeId &&
    left.currentGroupId === right.desiredGroupId &&
    left.desiredGroupId === right.currentGroupId
  );
}

export function findReciprocalSoloMatch(
  request: RequestLike,
  candidates: RequestLike[],
): RequestLike | null {
  return (
    candidates.find(
      (candidate) =>
        !isPairedRequest(candidate) &&
        (candidate.status === SwapRequestStatus.PENDING ||
          candidate.status === SwapRequestStatus.WAITING_FOR_MATCH) &&
        areReciprocalRequests(request, candidate),
    ) ?? null
  );
}

export function findReciprocalPairedMatch(
  request: RequestLike,
  confirmingStudentId: string,
  candidates: RequestLike[],
): RequestLike | null {
  return (
    candidates.find((candidate) => {
      if (!isPairedRequest(candidate)) {
        return false;
      }

      if (candidate.id === request.id) {
        return false;
      }

      if (candidate.status !== SwapRequestStatus.PENDING) {
        return false;
      }

      if (!areReciprocalRequests(request, candidate)) {
        return false;
      }

      return candidate.studentId === confirmingStudentId;
    }) ?? null
  );
}
