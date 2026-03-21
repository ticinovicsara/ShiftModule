import { StudentGroup, StudentGroupStatus } from '@repo/types';
import { mockStudentCourses } from './mock-student-courses.data';
import { mockGroups } from './mock-groups.data';

const labGroupsByCourse = new Map<string, string[]>();

mockGroups
  .filter((group) => group.id.includes('-lab-'))
  .forEach((group) => {
    const parts = group.id.split('-');
    const courseKey = parts[1];
    const groupIds = labGroupsByCourse.get(courseKey) ?? [];
    groupIds.push(group.id);
    labGroupsByCourse.set(courseKey, groupIds);
  });

function getCourseKey(courseId: string) {
  return courseId.replace('course-', '').replace(/-\d+$/, '');
}

function getStudentOrdinal(studentId: string) {
  const parsed = Number.parseInt(studentId.split('-').pop() ?? '1', 10);
  if (Number.isNaN(parsed)) {
    return 1;
  }
  return parsed;
}

export const mockStudentGroups: StudentGroup[] = mockStudentCourses.map(
  (sc, index) => {
    const courseKey = getCourseKey(sc.courseId);
    const labGroups = labGroupsByCourse.get(courseKey) ?? [];
    const studentOrdinal = getStudentOrdinal(sc.studentId);
    const group =
      labGroups[(studentOrdinal - 1) % Math.max(1, labGroups.length)];

    if (!group) {
      throw new Error(`No lab groups configured for course ${sc.courseId}`);
    }

    return {
      id: `studentgroup-${index + 1}`,
      studentId: sc.studentId,
      groupId: group,
      status: StudentGroupStatus.ASSIGNED,
    };
  },
);
