import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadInterface } from '../auth/interfaces/jwtPayload.interface';
import { env } from '../configs/config.env';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/skipAuth.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies['token'] as string;

    if (!token) {
      throw new UnauthorizedException('Token is required');
    }

    try {
      request['user'] = await this.jwtService.verifyAsync<JwtPayloadInterface>(
        token,
        {
          secret: env.JWT_SECRET,
          issuer: env.JWT_ISSUER,
          audience: env.JWT_AUDIENCE,
        },
      );
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
    return true;
  }
}
