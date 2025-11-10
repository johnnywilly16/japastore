import { Test, TestingModule } from '@nestjs/testing';
import { DailySessionsController } from './daily-sessions.controller';
import { DailySessionsService } from './daily-sessions.service';
import { DailySessionsRepository } from '../repositories/daily-sessions/daily-sessions.repository';
import { PrismaService } from '../prisma.service';
import { createMockPrismaService } from '../test-utils/prisma-mock';

describe('DailySessionsController', () => {
  let controller: DailySessionsController;
  let service: DailySessionsService;

  const mockSession = {
    id: 'session-uuid-1',
    userId: 1,
    date: new Date(),
    startTime: new Date(),
    status: 'active',
  };

  beforeEach(async () => {
    const prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailySessionsController],
      providers: [
        DailySessionsService,
        DailySessionsRepository,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    controller = module.get<DailySessionsController>(DailySessionsController);
    service = module.get<DailySessionsService>(DailySessionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('startSession', () => {
    it('should start a new session', async () => {
      const startDto = { date: new Date().toISOString() };
      jest.spyOn(service, 'startSession').mockResolvedValue(mockSession as any);

      const result = await controller.startSession(startDto, 1);

      expect(result).toBeDefined();
      expect(service.startSession).toHaveBeenCalledWith(1, startDto);
    });
  });

  describe('endSession', () => {
    it('should end an active session', async () => {
      const endDto = { totalSales: 1000, salesCount: 5 };
      jest.spyOn(service, 'endSession').mockResolvedValue({ ...mockSession, status: 'completed' } as any);

      const result = await controller.endSession(endDto, 1);

      expect(result).toBeDefined();
      expect(service.endSession).toHaveBeenCalledWith(1, endDto);
    });
  });

  describe('getCurrentSession', () => {
    it('should return current session', async () => {
      jest.spyOn(service, 'getCurrentSession').mockResolvedValue(mockSession as any);

      const result = await controller.getCurrentSession(1);

      expect(result).toBeDefined();
      expect(service.getCurrentSession).toHaveBeenCalledWith(1);
    });
  });

  describe('getSessionHistory', () => {
    it('should return session history', async () => {
      jest.spyOn(service, 'getSessionHistory').mockResolvedValue([mockSession] as any);

      const result = await controller.getSessionHistory('30', 1);

      expect(result).toBeDefined();
      expect(service.getSessionHistory).toHaveBeenCalledWith(1, 30);
    });
  });
});

