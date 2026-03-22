import { StudentGroup, StudentGroupStatus } from '@repo/types';
import { mockStudentCourses } from './mock-student-courses.data';
import { mockGroups } from './mock-groups.data';

const labGroupsByCourse = new Map<string, string[]>();
const exerciseGroupsByCourse = new Map<string, string[]>();

mockGroups
  .filter((group) => group.id.includes('-lab-'))
  .forEach((group) => {
    const parts = group.id.split('-');
    const courseKey = parts[1];
    const groupIds = labGroupsByCourse.get(courseKey) ?? [];
    groupIds.push(group.id);
    labGroupsByCourse.set(courseKey, groupIds);
  });

mockGroups
  .filter((group) => group.id.includes('-exercise-'))
  .forEach((group) => {
    const parts = group.id.split('-');
    const courseKey = parts[1];
    const groupIds = exerciseGroupsByCourse.get(courseKey) ?? [];
    groupIds.push(group.id);
    exerciseGroupsByCourse.set(courseKey, groupIds);
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

const studentsAssignedToBothKindsOnOsnove = new Set([
  'user-student-1',
  'user-student-2',
  'user-student-3',
  'user-student-4',
]);

let nextStudentGroupId = 1;

export const mockStudentGroups: StudentGroup[] = mockStudentCourses.flatMap(
  (sc) => {
    const courseKey = getCourseKey(sc.courseId);
    const studentOrdinal = getStudentOrdinal(sc.studentId);
    const isEvenStudent = studentOrdinal % 2 === 0;

    const labGroups = labGroupsByCourse.get(courseKey) ?? [];
    const exerciseGroups = exerciseGroupsByCourse.get(courseKey) ?? [];

    const selectedGroupIds: string[] = [];

    const labGroupId =
      labGroups[(studentOrdinal - 1) % Math.max(1, labGroups.length)];
    const exerciseGroupId =
      exerciseGroups[(studentOrdinal - 2) % Math.max(1, exerciseGroups.length)];

    const assignBothKinds =
      sc.courseId === 'course-osnove-1' &&
      studentsAssignedToBothKindsOnOsnove.has(sc.studentId);

    if (assignBothKinds) {
      if (labGroupId) {
        selectedGroupIds.push(labGroupId);
      }
      if (exerciseGroupId) {
        selectedGroupIds.push(exerciseGroupId);
      }
    } else if (isEvenStudent) {
      if (exerciseGroupId) {
        selectedGroupIds.push(exerciseGroupId);
      }
    } else if (labGroupId) {
      selectedGroupIds.push(labGroupId);
    }

    return selectedGroupIds.map((groupId) => ({
      id: `studentgroup-${nextStudentGroupId++}`,
      studentId: sc.studentId,
      groupId,
      status: StudentGroupStatus.ASSIGNED,
    }));
  },
);
