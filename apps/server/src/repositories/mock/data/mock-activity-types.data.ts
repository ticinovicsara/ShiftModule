import { ActivityType, ActivityTypeKind } from '@repo/types';

export const mockActivityTypes: ActivityType[] = [
  {
    id: 'activity-osnove-lecture-1',
    courseId: 'course-osnove-1',
    type: ActivityTypeKind.LECTURE,
  },
  {
    id: 'activity-osnove-lab-1',
    courseId: 'course-osnove-1',
    type: ActivityTypeKind.LAB,
  },
];

