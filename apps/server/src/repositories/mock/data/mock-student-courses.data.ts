import { StudentCourse } from '@repo/types';
import { mockUsers } from './mock-users.data';

export const mockStudentCourses: StudentCourse[] = mockUsers
  .filter((u) => u.id.startsWith('user-student-'))
  .map<StudentCourse>((user, index) => ({
    id: `studentcourse-${index + 1}`,
    studentId: user.id,
    courseId: 'course-osnove-1',
  }));

