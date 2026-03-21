import { Injectable, UnauthorizedException } from '@nestjs/common';
import { MockUserRepository } from '../repositories';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private readonly userRepo: MockUserRepository) {}

  async login(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const payload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET ?? 'secret', {
      expiresIn: '100d',
    });

    return { token, user: payload };
  }
}
