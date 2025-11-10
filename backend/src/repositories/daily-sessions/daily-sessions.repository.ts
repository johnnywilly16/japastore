import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { StartSessionDto } from '../../daily-sessions/dto/startSession.dto';
import { EndSessionDto } from '../../daily-sessions/dto/endSession.dto';
import { DailySessions } from '../../../generated/prisma';

@Injectable()
export class DailySessionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async startSession(userId: number, data: StartSessionDto): Promise<DailySessions | null> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Verificar se já existe uma sessão para hoje
      const existingSession = await this.prisma.dailySessions.findFirst({
        where: {
          userId,
          date: today,
        },
      });

      if (existingSession) {
        // Se existe e está ativa, retorna ela
        if (existingSession.status === 'active') {
          return existingSession;
        }
        // Se existe mas foi finalizada, cria uma nova (permite reabrir o dia)
      }

      return await this.prisma.dailySessions.create({
        data: {
          userId,
          date: today,
          startTime: new Date(),
          status: 'active',
          notes: data.notes,
        },
      });
    } catch (error) {
      console.error('Error starting session:', error);
      return null;
    }
  }

  async endSession(userId: number, data: EndSessionDto): Promise<DailySessions | null> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return await this.prisma.dailySessions.updateMany({
        where: {
          userId,
          date: today,
          status: 'active',
        },
        data: {
          endTime: new Date(),
          status: 'completed',
          notes: data.notes,
        },
      }).then(async (result) => {
        if (result.count > 0) {
          return await this.getCurrentSession(userId);
        }
        return null;
      });
    } catch (error) {
      console.error('Error ending session:', error);
      return null;
    }
  }

  async getCurrentSession(userId: number): Promise<DailySessions | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await this.prisma.dailySessions.findFirst({
      where: {
        userId,
        date: today,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getSessionHistory(userId: number, limit: number = 30): Promise<DailySessions[]> {
    return await this.prisma.dailySessions.findMany({
      where: {
        userId,
      },
      orderBy: {
        date: 'desc',
      },
      take: limit,
    });
  }

  async updateSessionMetrics(sessionId: number, totalSales: number, salesCount: number): Promise<DailySessions | null> {
    try {
      return await this.prisma.dailySessions.update({
        where: {
          id: sessionId,
        },
        data: {
          totalSales,
          salesCount,
        },
      });
    } catch (error) {
      console.error('Error updating session metrics:', error);
      return null;
    }
  }

  async getSessionByExternalId(externalId: string): Promise<DailySessions | null> {
    return await this.prisma.dailySessions.findUnique({
      where: {
        externalId,
      },
    });
  }
}
