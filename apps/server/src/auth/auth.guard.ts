import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) throw new UnauthorizedException('No token provided');
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET ?? 'secret');
      request['user'] = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
