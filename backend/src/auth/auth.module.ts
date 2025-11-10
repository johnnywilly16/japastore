import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { env } from '../configs/config.env';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '../guards/auth.guard';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: env.JWT_SECRET,
      signOptions: {
        expiresIn: env.JWT_EXPIRATION_TIME,
        audience: env.JWT_AUDIENCE,
        issuer: env.JWT_ISSUER,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    // Temporariamente desabilitado para teste
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthGuard,
    // },
  ],
})
export class AuthModule {}
