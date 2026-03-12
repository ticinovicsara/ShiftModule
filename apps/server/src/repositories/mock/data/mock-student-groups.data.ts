import { StudentGroup, StudentGroupStatus } from '@repo/types';
import { mockStudentCourses } from './mock-student-courses.data';
import { mockGroups } from './mock-groups.data';

const labGroups = mockGroups.filter((g) => g.id.startsWith('group-lab-'));

export const mockStudentGroups: StudentGroup[] = mockStudentCourses.map(
  (sc, index) => {
    const group = labGroups[index % labGroups.length];
    return {
      id: `studentgroup-${index + 1}`,
      studentId: sc.studentId,
      groupId: group.id,
      status: StudentGroupStatus.ASSIGNED,
    };
  },
);

