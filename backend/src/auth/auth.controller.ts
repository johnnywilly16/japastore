import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Response,
} from '@nestjs/common';
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { AuthService } from './auth.service';
import { AuthRequestDto, AuthRequestDtoSchema } from './dto/authRequest.dto';
import { ZodValidationPipe } from '../pipes/zodValidation.pipe';
import { SkipAuth } from '../decorators/skipAuth.decorator';

@Controller({
  version: '1',
  path: 'auth',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SkipAuth()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(AuthRequestDtoSchema))
    authRequestDto: AuthRequestDto,
    @Response() res: ExpressResponse,
  ) {
    const result = await this.authService.login(
      authRequestDto.email,
      authRequestDto.password,
    );

    // Configurar cookie httpOnly
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    });

    return res.json(result);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Request() req: ExpressRequest, @Response() res: ExpressResponse) {
    const currentToken = req.cookies['token'] as string;
    const result = await this.authService.refreshToken(currentToken);

    // Configurar novo cookie
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    });

    return res.json(result);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Response() res: ExpressResponse) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.json({ message: 'Successfully logged out' });
  }
}
