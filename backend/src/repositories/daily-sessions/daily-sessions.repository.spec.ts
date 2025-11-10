import { Test, TestingModule } from '@nestjs/testing';
import { DailySessionsRepository } from './daily-sessions.repository';
import { PrismaService } from '../../prisma.service';
import { createMockPrismaService } from '../../test-utils/prisma-mock';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('DailySessionsRepository', () => {
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
  };

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DailySessionsRepository,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    repository = module.get<DailySessionsRepository>(DailySessionsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('startSession', () => {
    it('should start a new session', async () => {
      prisma.dailySessions.findFirst = jest.fn().mockResolvedValue(null);
      prisma.dailySessions.create = jest.fn().mockResolvedValue(mockSession);

      const result = await repository.startSession(1, { notes: 'Starting session' });

      expect(result).toBeDefined();
      expect(prisma.dailySessions.create).toHaveBeenCalled();
    });

    it('should return existing active session if already exists', async () => {
      prisma.dailySessions.findFirst = jest.fn().mockResolvedValue(mockSession);

      const result = await repository.startSession(1, { notes: 'Starting session' });

      expect(result).toBeDefined();
      expect(result).toEqual(mockSession);
    });
  });

  describe('endSession', () => {
    it('should end an active session', async () => {
      prisma.dailySessions.updateMany = jest.fn().mockResolvedValue({ count: 1 });
      prisma.dailySessions.findFirst = jest.fn().mockResolvedValue({
        ...mockSession,
        endTime: new Date(),
        status: 'completed',
      });

      const result = await repository.endSession(1, { notes: 'Ending session' });

      expect(result).toBeDefined();
      expect(prisma.dailySessions.updateMany).toHaveBeenCalled();
    });
  });

  describe('getCurrentSession', () => {
    it('should return current active session', async () => {
      prisma.dailySessions.findFirst = jest.fn().mockResolvedValue(mockSession);

      const result = await repository.getCurrentSession(1);

      expect(result).toBeDefined();
      expect(prisma.dailySessions.findFirst).toHaveBeenCalled();
    });
  });

  describe('getSessionHistory', () => {
    it('should return session history', async () => {
      prisma.dailySessions.findMany = jest.fn().mockResolvedValue([mockSession]);

      const result = await repository.getSessionHistory(1, 30);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

