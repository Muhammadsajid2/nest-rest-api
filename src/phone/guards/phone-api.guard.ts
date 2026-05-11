import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class PhoneApiGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const providedPassword = request.query?.password as string;
    const expectedPassword =
      process.env.PHONE_API_PASSWORD || 'phone-secret-123';

    if (!providedPassword) {
      throw new UnauthorizedException(
        'Missing required query parameter: password',
      );
    }

    if (providedPassword !== expectedPassword) {
      throw new UnauthorizedException('Invalid password');
    }

    return true;
  }
}
