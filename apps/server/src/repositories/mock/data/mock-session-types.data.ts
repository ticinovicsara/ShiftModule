import { SessionType, SessionKind } from '@repo/types';

export const mockSessionTypes: SessionType[] = [
  {
    id: 'session-osnove-lecture-1',
    courseId: 'course-osnove-1',
    type: SessionKind.LECTURE,
  },
  {
    id: 'session-osnove-lab-1',
    courseId: 'course-osnove-1',
    type: SessionKind.LAB,
  },
];
