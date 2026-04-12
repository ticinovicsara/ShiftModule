import * as jwt from 'jsonwebtoken';
import { UserRole } from '@repo/types';
import { seedIds } from './seed-ids';
import { AppConfig } from 'src/config/app.config';

type RoleTokenData = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
};

const roleDefaults: Record<UserRole, RoleTokenData> = {
  [UserRole.ADMIN]: {
    id: seedIds.users.admin,
    email: 'admin@fesb.hr',
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
  },
  [UserRole.PROFESSOR]: {
    id: seedIds.users.professor,
    email: 'ivan.horvat@fesb.hr',
    firstName: 'Ivan',
    lastName: 'Horvat',
    role: UserRole.PROFESSOR,
  },
  [UserRole.STUDENT]: {
    id: seedIds.users.student1,
    email: 'student1@fesb.hr',
    firstName: 'Student1',
    lastName: 'Prezime',
    role: UserRole.STUDENT,
  },
};

export function signToken(
  role: UserRole,
  overrides: Partial<RoleTokenData> = {},
): string {
  const payload: RoleTokenData = {
    ...roleDefaults[role],
    ...overrides,
    role,
  };

  const secret = process.env.JWT_SECRET || AppConfig.jwt.secret;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign(payload, secret, { expiresIn: '8h' });
}

export function authHeader(role: UserRole): { Authorization: string } {
  return { Authorization: `Bearer ${signToken(role)}` };
}

export function invalidAuthHeader(): { Authorization: string } {
  return { Authorization: 'Bearer invalid.jwt.token' };
}
