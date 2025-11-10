
jest.mock('@pipes/zodValidation.pipe', () => ({
  ZodValidationPipe: jest.fn().mockImplementation(() => ({
    transform: jest.fn((value) => value),
  })),
}), { virtual: true });

import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from '../repositories/users/users.repository';
import { PrismaService } from '../prisma.service';
import { createMockPrismaService } from '../test-utils/prisma-mock';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        UsersRepository,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
