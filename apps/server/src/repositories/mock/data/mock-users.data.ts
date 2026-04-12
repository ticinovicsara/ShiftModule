import { User, UserRole } from '@repo/types';

export const mockUsers: User[] = [
  {
    id: 'user-admin-1',
    email: 'admin@fesb.hr',
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
  },
  {
    id: 'user-professor-1',
    email: 'ivan.horvat@fesb.hr',
    firstName: 'Ivan',
    lastName: 'Horvat',
    role: UserRole.PROFESSOR,
  },
  {
    id: 'user-professor-2',
    email: 'profesor@fesb.hr',
    firstName: 'Marko',
    lastName: 'Kovacic',
    role: UserRole.PROFESSOR,
  },
  ...(() => {
    const studentGpas = [4.8, 4.5, 3.9, 3.6, 3.2, 2.9, 4.2, 3.4, 2.7, 4.0];

    return Array.from({ length: 10 }).map((_, index) => {
      const i = index + 1;
      return {
        id: `user-student-${i}`,
        email: `student${i}@fesb.hr`,
        firstName: `Student${i}`,
        lastName: 'Prezime',
        role: UserRole.STUDENT,
        gpa: studentGpas[index],
      } satisfies User;
    });
  })(),
];
