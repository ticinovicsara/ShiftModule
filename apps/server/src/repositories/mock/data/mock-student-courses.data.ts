import { StudentCourse } from '@repo/types';
import { mockUsers } from './mock-users.data';

// Each student is enrolled in 2-3 realistic courses instead of all 5
const studentEnrollments: Record<string, string[]> = {
  'user-student-1': ['course-osnove-1', 'course-mreze-1'],
  'user-student-2': ['course-osnove-1', 'course-algoritmi-1'],
  'user-student-3': ['course-osnove-1', 'course-baze-1'],
  'user-student-4': ['course-osnove-1', 'course-os-1'],
  'user-student-5': ['course-mreze-1', 'course-algoritmi-1'],
  'user-student-6': ['course-mreze-1', 'course-baze-1'],
  'user-student-7': ['course-algoritmi-1', 'course-baze-1'],
  'user-student-8': ['course-osnove-1', 'course-mreze-1'],
  'user-student-9': ['course-mreze-1', 'course-os-1'],
  'user-student-10': ['course-algoritmi-1', 'course-os-1'],
};

export const mockStudentCourses: StudentCourse[] = mockUsers
  .filter((u) => u.id.startsWith('user-student-'))
  .flatMap<StudentCourse>((user, studentIndex) => {
    const courseIds = studentEnrollments[user.id] ?? [];
    return courseIds.map((courseId, courseIndex) => ({
      id: `studentcourse-${studentIndex + 1}-${courseIndex + 1}`,
      studentId: user.id,
      courseId,
    }));
  });
