import { Group } from '@repo/types';

const groupLoad = [9, 12, 15, 7];
const weekDays = ['Ponedjeljak', 'Utorak', 'Srijeda', 'Cetvrtak'];
const timeSlots = ['08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00'];

function buildGroups(
  courseKey: string,
  sessionKind: 'lab' | 'exercise',
  labelPrefix: 'LAB' | 'VJ',
  offset: number,
): Group[] {
  return Array.from({ length: 4 }).map((_, index) => {
    const i = index + 1;
    const load = Math.min(19, groupLoad[index] + offset);
    const roomPrefix = sessionKind === 'lab' ? 'Lab' : 'Ucionica';
    return {
      id: `group-${courseKey}-${sessionKind}-${i}`,
      name: `${labelPrefix}${i}`,
      capacity: 20,
      currentCount: load,
      isActive: true,
      sessionTypeId: `session-${courseKey}-${sessionKind}-1`,
      schedule: {
        day: weekDays[index],
        time: timeSlots[index],
        room: `${roomPrefix} ${400 + offset * 10 + i}`,
      },
    } satisfies Group;
  });
}

export const mockGroups: Group[] = [
  ...buildGroups('osnove', 'lab', 'LAB', 0),
  ...buildGroups('osnove', 'exercise', 'VJ', 1),
  ...buildGroups('mreze', 'lab', 'LAB', 2),
  ...buildGroups('mreze', 'exercise', 'VJ', 0),
  ...buildGroups('algoritmi', 'lab', 'LAB', 1),
  ...buildGroups('algoritmi', 'exercise', 'VJ', 2),
  ...buildGroups('baze', 'lab', 'LAB', 0),
  ...buildGroups('baze', 'exercise', 'VJ', 1),
  ...buildGroups('os', 'lab', 'LAB', 2),
  ...buildGroups('os', 'exercise', 'VJ', 0),
];
