import { Group } from '@repo/types';

export const mockGroups: Group[] = [
  {
    id: 'group-lecture-1',
    name: 'PRED1',
    capacity: 200,
    currentCount: 0,
    isActive: true,
    sessionTypeId: 'activity-osnove-lecture-1',
  },
  ...Array.from({ length: 5 }).map((_, index) => {
    const i = index + 1;
    return {
      id: `group-lab-${i}`,
      name: `LAB${i}`,
      capacity: 20,
      currentCount: 0,
      isActive: true,
      sessionTypeId: 'activity-osnove-lab-1',
    } satisfies Group;
  }),
];
