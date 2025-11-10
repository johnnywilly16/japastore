import {
  Controller,
  Get,
  Post,
  Body,
  Query,
} from '@nestjs/common';
import { DailySessionsService } from './daily-sessions.service';
import { StartSessionDto, StartSessionDtoSchema } from './dto/startSession.dto';
import { EndSessionDto, EndSessionDtoSchema } from './dto/endSession.dto';
import { ZodValidationPipe } from '../pipes/zodValidation.pipe';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller({
  version: '1',
  path: 'daily-sessions',
})
export class DailySessionsController {
  constructor(
    private readonly dailySessionsService: DailySessionsService,
  ) {}

  @Post('start')
  async startSession(
    @Body(new ZodValidationPipe(StartSessionDtoSchema))
    startSessionDto: StartSessionDto,
    @CurrentUser() userId: number,
  ) {
    return this.dailySessionsService.startSession(userId, startSessionDto);
  }

  @Post('end')
  async endSession(
    @Body(new ZodValidationPipe(EndSessionDtoSchema))
    endSessionDto: EndSessionDto,
    @CurrentUser() userId: number,
  ) {
    return this.dailySessionsService.endSession(userId, endSessionDto);
  }

  @Get('current')
  async getCurrentSession(@CurrentUser() userId: number) {
    return this.dailySessionsService.getCurrentSession(userId);
  }

  @Get('history')
  async getSessionHistory(
    @Query('limit') limit: string = '30',
    @CurrentUser() userId: number,
  ) {
    return this.dailySessionsService.getSessionHistory(userId, parseInt(limit));
  }
}
