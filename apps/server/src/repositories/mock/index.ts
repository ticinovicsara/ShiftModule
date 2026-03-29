export * from './data/mock-users.data';
export * from './data/mock-study-majors.data';
export * from './data/mock-courses.data';
export * from './data/mock-session-types.data';
export * from './data/mock-groups.data';
export * from './data/mock-student-courses.data';
export * from './data/mock-student-groups.data';
export * from './data/mock-swap-requests.data';

export * from './mock-user.repository';
export * from './mock-study-major.repository';
export * from './mock-course.repository';
export * from './mock-session-type';
export * from './mock-group.repository';
export * from './mock-student-course.repository';
export * from './mock-student-group.repository';
export * from './mock-swap-request.repository';

// Re-export CourseWithSessionTypes for backward compatibility
export type { CourseWithSessionTypes } from '../interfaces/course.repository.interface';
