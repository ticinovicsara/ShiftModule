import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import type { IUserRepository } from 'src/repositories';
import * as jwt from 'jsonwebtoken';
import { AppConfig } from '../config/app.config';

@Injectable()
export class AuthService {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}

  async login(email: string, password: string) {
    void password;
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const payload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    const secret = AppConfig.jwt.secret;
    if (!secret) {
      throw new UnauthorizedException('JWT secret is not configured');
    }

    const token = jwt.sign(payload, secret, {
      expiresIn: AppConfig.jwt.expiresIn as any,
    });

    return { token, user: payload };
  }
}
