export const seedIds = {
  users: {
    admin: 'user-admin-1',
    professor: 'user-professor-1',
    student1: 'user-student-1',
    student2: 'user-student-2',
  },
  studyMajors: {
    racunarstvo1: 'major-preddiplomski-racunarstvo-1',
  },
  courses: {
    osnove1: 'course-osnove-1',
  },
  sessionTypes: {
    lecture: 'session-osnove-lecture-1',
    lab: 'session-osnove-lab-1',
  },
  activityTypes: {
    lecture: 'activity-osnove-lecture-1',
    lab: 'activity-osnove-lab-1',
  },
  groups: {
    lecture1: 'group-lecture-1',
    lab1: 'group-lab-1',
    lab2: 'group-lab-2',
    lab3: 'group-lab-3',
    lab4: 'group-lab-4',
    lab5: 'group-lab-5',
  },
  studentCourses: {
    studentcourse1: 'studentcourse-1',
    studentcourse2: 'studentcourse-2',
  },
  studentGroups: {
    studentgroup1: 'studentgroup-1',
    studentgroup2: 'studentgroup-2',
    studentgroup3: 'studentgroup-3',
  },
  swapRequests: {
    request1: 'swaprequest-1',
    request2: 'swaprequest-2',
  },
  notFound: {
    user: 'user-does-not-exist',
    course: 'course-does-not-exist',
    group: 'group-does-not-exist',
    sessionType: 'session-type-does-not-exist',
    studyMajor: 'study-major-does-not-exist',
    swapRequest: 'swaprequest-does-not-exist',
  },
} as const;
