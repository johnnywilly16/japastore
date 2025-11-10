import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { StartSessionDto } from './dto/startSession.dto';
import { EndSessionDto } from './dto/endSession.dto';
import { DailySessionDto } from './dto/dailySession.dto';
import { DailySessionsRepository } from '../repositories/daily-sessions/daily-sessions.repository';

@Injectable()
export class DailySessionsService {
  constructor(private readonly dailySessionsRepository: DailySessionsRepository) {}

  async startSession(userId: number, data: StartSessionDto): Promise<DailySessionDto> {
    const result = await this.dailySessionsRepository.startSession(userId, data);

    if (!result) {
      throw new InternalServerErrorException('Failed to start session');
    }

    return this.transformToDto(result);
  }

  async endSession(userId: number, data: EndSessionDto): Promise<DailySessionDto> {
    // Verificar se existe sessão ativa
    const currentSession = await this.dailySessionsRepository.getCurrentSession(userId);
    
    if (!currentSession || currentSession.status !== 'active') {
      throw new BadRequestException('No active session found');
    }

    const result = await this.dailySessionsRepository.endSession(userId, data);

    if (!result) {
      throw new InternalServerErrorException('Failed to end session');
    }

    return this.transformToDto(result);
  }

  async getCurrentSession(userId: number): Promise<DailySessionDto | null> {
    const result = await this.dailySessionsRepository.getCurrentSession(userId);
    
    if (!result) {
      return null;
    }

    return this.transformToDto(result);
  }

  async getSessionHistory(userId: number, limit: number = 30): Promise<DailySessionDto[]> {
    const sessions = await this.dailySessionsRepository.getSessionHistory(userId, limit);

    return sessions.map(session => this.transformToDto(session));
  }

  async updateSessionMetrics(sessionId: number, totalSales: number, salesCount: number): Promise<DailySessionDto> {
    const result = await this.dailySessionsRepository.updateSessionMetrics(sessionId, totalSales, salesCount);

    if (!result) {
      throw new NotFoundException('Session not found');
    }

    return this.transformToDto(result);
  }

  private transformToDto(session: any): DailySessionDto {
    const duration = session.endTime 
      ? Math.floor((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / (1000 * 60))
      : session.startTime 
        ? Math.floor((new Date().getTime() - new Date(session.startTime).getTime()) / (1000 * 60))
        : 0;

    return {
      id: session.externalId,
      date: session.date.toISOString().split('T')[0],
      startTime: session.startTime,
      endTime: session.endTime || undefined,
      status: session.status,
      totalSales: Number(session.totalSales),
      salesCount: session.salesCount,
      notes: session.notes || undefined,
      duration,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }
}
