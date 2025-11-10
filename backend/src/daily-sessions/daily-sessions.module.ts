import { Module } from '@nestjs/common';
import { DailySessionsService } from './daily-sessions.service';
import { DailySessionsController } from './daily-sessions.controller';
import { DailySessionsRepository } from '../repositories/daily-sessions/daily-sessions.repository';
import { PrismaService } from '../prisma.service';
import { UsersService } from '../users/users.service';
import { UsersRepository } from '../repositories/users/users.repository';

@Module({
  controllers: [DailySessionsController],
  providers: [
    DailySessionsService, 
    DailySessionsRepository, 
    PrismaService,
    UsersService,
    UsersRepository,
  ],
  exports: [DailySessionsService],
})
export class DailySessionsModule {}
