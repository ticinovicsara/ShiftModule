import { UserRole } from '@repo/types';

export class CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}
