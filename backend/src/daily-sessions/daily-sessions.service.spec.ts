import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DailySessionsService } from './daily-sessions.service';
import { DailySessionsRepository } from '../repositories/daily-sessions/daily-sessions.repository';
import { PrismaService } from '../prisma.service';
import { createMockPrismaService } from '../test-utils/prisma-mock';

describe('DailySessionsService', () => {
  let service: DailySessionsService;
  let repository: DailySessionsRepository;
  let prisma: ReturnType<typeof createMockPrismaService>;

  const mockSession = {
    id: 1,
    externalId: 'session-uuid-1',
    userId: 1,
    date: new Date(),
    startTime: new Date(),
    endTime: null,
    status: 'active',
    totalSales: 0,
    salesCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DailySessionsService,
        DailySessionsRepository,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<DailySessionsService>(DailySessionsService);
    repository = module.get<DailySessionsRepository>(DailySessionsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('startSession', () => {
    it('should start a new session', async () => {
      const startDto = { notes: 'Starting session' };
      jest.spyOn(repository, 'startSession').mockResolvedValue(mockSession as any);

      const result = await service.startSession(1, startDto);

      expect(result).toBeDefined();
      expect(repository.startSession).toHaveBeenCalledWith(1, startDto);
    });

    it('should throw InternalServerErrorException if session creation fails', async () => {
      const startDto = { notes: 'Starting session' };
      jest.spyOn(repository, 'startSession').mockResolvedValue(null);

      await expect(service.startSession(1, startDto)).rejects.toThrow(
        'Failed to start session',
      );
    });
  });

  describe('endSession', () => {
    it('should end an active session', async () => {
      const endDto = { notes: 'Ending session' };
      const endedSession = { ...mockSession, endTime: new Date(), status: 'completed' };
      jest.spyOn(repository, 'getCurrentSession').mockResolvedValue(mockSession as any);
      jest.spyOn(repository, 'endSession').mockResolvedValue(endedSession as any);

      const result = await service.endSession(1, endDto);

      expect(result).toBeDefined();
      expect(result.status).toBe('completed');
    });

    it('should throw BadRequestException if no active session', async () => {
      jest.spyOn(repository, 'getCurrentSession').mockResolvedValue(null);

      await expect(service.endSession(1, { notes: 'Ending' })).rejects.toThrow(
        'No active session found',
      );
    });

    it('should throw BadRequestException if session is not active', async () => {
      const completedSession = { ...mockSession, status: 'completed' };
      jest.spyOn(repository, 'getCurrentSession').mockResolvedValue(completedSession as any);

      await expect(service.endSession(1, { notes: 'Ending' })).rejects.toThrow(
        'No active session found',
      );
    });

    it('should throw InternalServerErrorException if session end fails', async () => {
      jest.spyOn(repository, 'getCurrentSession').mockResolvedValue(mockSession as any);
      jest.spyOn(repository, 'endSession').mockResolvedValue(null);

      await expect(service.endSession(1, { notes: 'Ending' })).rejects.toThrow(
        'Failed to end session',
      );
    });
  });

  describe('getCurrentSession', () => {
    it('should return current session', async () => {
      jest.spyOn(repository, 'getCurrentSession').mockResolvedValue(mockSession as any);

      const result = await service.getCurrentSession(1);

      expect(result).toBeDefined();
      expect(repository.getCurrentSession).toHaveBeenCalledWith(1);
    });

    it('should return null if no active session', async () => {
      jest.spyOn(repository, 'getCurrentSession').mockResolvedValue(null);

      const result = await service.getCurrentSession(1);

      expect(result).toBeNull();
    });
  });

  describe('getSessionHistory', () => {
    it('should return session history', async () => {
      jest.spyOn(repository, 'getSessionHistory').mockResolvedValue([mockSession] as any);

      const result = await service.getSessionHistory(1, 30);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(repository.getSessionHistory).toHaveBeenCalledWith(1, 30);
    });
  });

  describe('updateSessionMetrics', () => {
    it('should update session metrics', async () => {
      jest.spyOn(repository, 'updateSessionMetrics').mockResolvedValue(mockSession as any);

      const result = await service.updateSessionMetrics(1, 1000, 5);

      expect(result).toBeDefined();
      expect(repository.updateSessionMetrics).toHaveBeenCalledWith(1, 1000, 5);
    });

    it('should throw NotFoundException if session not found', async () => {
      jest.spyOn(repository, 'updateSessionMetrics').mockResolvedValue(null);

      await expect(service.updateSessionMetrics(999, 1000, 5)).rejects.toThrow(NotFoundException);
    });
  });
});

