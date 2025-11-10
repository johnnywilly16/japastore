import { Injectable, UnauthorizedException } from '@nestjs/common';
import crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from '../users/dto/user.dto';
import { comparePasswords } from '../utils/bcrypt.utils';
import { AuthResponseDto } from './dto/authResponse.dto';
import { JwtPayloadInterface } from './interfaces/jwtPayload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private _generateToken(user: UserDto): string {
    const payload = {
      name: user.name,
      email: user.email,
      jti: crypto.randomUUID(),
    };

    return this.jwtService.sign(payload, {
      subject: user.id,
    });
  }

  async login(email: string, password: string): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(email);
    const passwordValid = await comparePasswords(password, user.passwordHash);

    if (!user || !passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this._generateToken(user);

    return {
      token,
      userName: user.name,
      userEmail: user.email,
    };
  }

  async refreshToken(currentToken: string): Promise<AuthResponseDto> {
    try {
      const decoded = this.jwtService.verify<JwtPayloadInterface>(currentToken);

      const user = await this.usersService.findOne(
        decoded.sub ? decoded.sub : '',
      );

      const token = this._generateToken(user);
      return {
        token,
        userName: user.name,
        userEmail: user.email,
      };
    } catch (error: unknown) {
      throw new UnauthorizedException(
        'Invalid token',
        error instanceof Error ? { cause: error } : undefined,
      );
    }
  }
}
