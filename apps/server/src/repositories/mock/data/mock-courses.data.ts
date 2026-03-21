import { Course } from '@repo/types';

export const mockCourses: Course[] = [
  {
    id: 'course-osnove-1',
    title: 'Osnove programiranja',
    studyMajorId: 'major-preddiplomski-racunarstvo-1',
    professorId: 'user-professor-1',
    merlinUrl: 'https://merlin.srce.hr/course/view.php?id=1001',
  },
  {
    id: 'course-mreze-1',
    title: 'Računalne mreže',
    studyMajorId: 'major-preddiplomski-racunarstvo-1',
    professorId: 'user-professor-2',
    merlinUrl: 'https://merlin.srce.hr/course/view.php?id=1002',
  },
  {
    id: 'course-algoritmi-1',
    title: 'Algoritmi i strukture podataka',
    studyMajorId: 'major-preddiplomski-racunarstvo-1',
    professorId: 'user-professor-1',
    merlinUrl: 'https://merlin.srce.hr/course/view.php?id=1003',
  },
  {
    id: 'course-baze-1',
    title: 'Baze podataka',
    studyMajorId: 'major-preddiplomski-racunarstvo-1',
    professorId: 'user-professor-2',
    merlinUrl: 'https://merlin.srce.hr/course/view.php?id=1004',
  },
  {
    id: 'course-os-1',
    title: 'Operacijski sustavi',
    studyMajorId: 'major-preddiplomski-racunarstvo-1',
    professorId: 'user-professor-2',
    merlinUrl: 'https://merlin.srce.hr/course/view.php?id=1005',
  },
];
