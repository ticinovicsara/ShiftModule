import {
  StudentSwapViewState,
  SwapRequest,
  SwapRequestStatus,
  SwapRequestType,
} from '@repo/types';
import { isPairedRequest } from './matching.helper';

const SOLO_MATCH_WINDOW_DAYS = 7;

function normalizeEmail(email?: string) {
  return (email ?? '').trim().toLowerCase();
}

export function calculateMatchDeadline(fromDate: Date = new Date()): Date {
  return new Date(
    fromDate.getTime() + SOLO_MATCH_WINDOW_DAYS * 24 * 60 * 60 * 1000,
  );
}

export function isMatchDeadlinePassed(
  request: Pick<SwapRequest, 'createdAt' | 'matchDeadline'>,
  now: Date,
): boolean {
  const fallbackDeadline = calculateMatchDeadline(request.createdAt);
  const deadline = request.matchDeadline ?? fallbackDeadline;
  return deadline.getTime() <= now.getTime();
}

export function getProcessingMode(
  request: Pick<SwapRequest, 'status'>,
): 'MANUAL' | 'AUTOMATIC' {
  return request.status === SwapRequestStatus.AUTO_RESOLVED
    ? 'AUTOMATIC'
    : 'MANUAL';
}

export function isVisibleToStaff(
  request: Pick<SwapRequest, 'requestType' | 'partnerConfirmed' | 'status'>,
): boolean {
  if (request.requestType !== SwapRequestType.PAIRED) {
    return true;
  }

  return (
    request.partnerConfirmed || request.status === SwapRequestStatus.REJECTED
  );
}

export function getStudentViewState(
  request: SwapRequest,
  viewerId: string,
  viewerEmail: string,
): StudentSwapViewState {
  if (request.status === SwapRequestStatus.AUTO_RESOLVED) {
    return StudentSwapViewState.AUTO_PROCESSED;
  }

  if (request.status === SwapRequestStatus.APPROVED) {
    return StudentSwapViewState.MANUALLY_APPROVED;
  }

  if (request.status === SwapRequestStatus.REJECTED) {
    return StudentSwapViewState.MANUALLY_REJECTED;
  }

  if (request.requestType !== SwapRequestType.PAIRED) {
    return StudentSwapViewState.QUEUED_FOR_REVIEW;
  }

  const isIncomingPartnerRequest =
    request.studentId !== viewerId &&
    normalizeEmail(request.partnerEmail) === viewerEmail;

  if (isIncomingPartnerRequest && !request.partnerConfirmed) {
    return StudentSwapViewState.INCOMING_PARTNER_CONFIRMATION;
  }

  if (!isIncomingPartnerRequest && !request.partnerConfirmed) {
    return StudentSwapViewState.AWAITING_PARTNER_CONFIRMATION;
  }

  return StudentSwapViewState.QUEUED_FOR_REVIEW;
}

export function getCreateRequestLifecycle(
  requestType: SwapRequestType,
  createdAt: Date = new Date(),
): Pick<SwapRequest, 'status' | 'partnerConfirmed' | 'matchDeadline'> {
  if (requestType === SwapRequestType.SOLO) {
    return {
      status: SwapRequestStatus.WAITING_FOR_MATCH,
      partnerConfirmed: true,
      matchDeadline: calculateMatchDeadline(createdAt),
    };
  }

  return {
    status: SwapRequestStatus.PENDING,
    partnerConfirmed: false,
    matchDeadline: undefined,
  };
}

export function shouldAutoCompletePairedRequest(
  request: Pick<SwapRequest, 'requestType' | 'status' | 'partnerConfirmed'>,
): boolean {
  return (
    request.requestType === SwapRequestType.PAIRED &&
    request.status === SwapRequestStatus.PENDING &&
    request.partnerConfirmed
  );
}

export function buildStaffDedupKey(
  request: Pick<
    SwapRequest,
    | 'id'
    | 'requestType'
    | 'studentId'
    | 'partnerStudentId'
    | 'partnerEmail'
    | 'currentGroupId'
    | 'desiredGroupId'
    | 'courseId'
    | 'sessionTypeId'
    | 'status'
  >,
): string {
  if (!isPairedRequest(request)) {
    return request.id;
  }

  const participantA = request.studentId;
  const participantB = request.partnerStudentId ?? request.partnerEmail ?? '';
  const participants = [participantA, participantB].sort().join('|');
  const groups = [request.currentGroupId, request.desiredGroupId]
    .sort()
    .join('|');

  return [
    request.courseId,
    request.sessionTypeId,
    request.status,
    participants,
    groups,
  ].join('|');
}

export function dedupeStaffCards(requests: SwapRequest[]): SwapRequest[] {
  const deduped = new Map<string, SwapRequest>();
  for (const request of requests) {
    const key = buildStaffDedupKey(request);
    if (!deduped.has(key)) {
      deduped.set(key, request);
    }
  }
  return Array.from(deduped.values());
}
