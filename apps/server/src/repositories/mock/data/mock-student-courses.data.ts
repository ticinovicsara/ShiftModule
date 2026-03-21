import { StudentCourse } from '@repo/types';
import { mockUsers } from './mock-users.data';

const courseIds = [
  'course-osnove-1',
  'course-mreze-1',
  'course-algoritmi-1',
  'course-baze-1',
  'course-os-1',
];

export const mockStudentCourses: StudentCourse[] = mockUsers
  .filter((u) => u.id.startsWith('user-student-'))
  .flatMap<StudentCourse>((user, studentIndex) =>
    courseIds.map((courseId, courseIndex) => ({
      id: `studentcourse-${studentIndex + 1}-${courseIndex + 1}`,
      studentId: user.id,
      courseId,
    })),
  );
