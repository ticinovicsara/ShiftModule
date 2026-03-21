import { SessionType, SessionKind } from '@repo/types';

export const mockSessionTypes: SessionType[] = [
  {
    id: 'session-osnove-lab-1',
    courseId: 'course-osnove-1',
    type: SessionKind.LAB,
  },
  {
    id: 'session-osnove-exercise-1',
    courseId: 'course-osnove-1',
    type: SessionKind.EXERCISE,
  },
  {
    id: 'session-mreze-lab-1',
    courseId: 'course-mreze-1',
    type: SessionKind.LAB,
  },
  {
    id: 'session-mreze-exercise-1',
    courseId: 'course-mreze-1',
    type: SessionKind.EXERCISE,
  },
  {
    id: 'session-algoritmi-lab-1',
    courseId: 'course-algoritmi-1',
    type: SessionKind.LAB,
  },
  {
    id: 'session-algoritmi-exercise-1',
    courseId: 'course-algoritmi-1',
    type: SessionKind.EXERCISE,
  },
  {
    id: 'session-baze-lab-1',
    courseId: 'course-baze-1',
    type: SessionKind.LAB,
  },
  {
    id: 'session-baze-exercise-1',
    courseId: 'course-baze-1',
    type: SessionKind.EXERCISE,
  },
  {
    id: 'session-os-lab-1',
    courseId: 'course-os-1',
    type: SessionKind.LAB,
  },
  {
    id: 'session-os-exercise-1',
    courseId: 'course-os-1',
    type: SessionKind.EXERCISE,
  },
];
