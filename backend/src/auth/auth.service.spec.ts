
jest.mock('../utils/bcrypt.utils');

jest.mock('crypto', () => ({
  default: {
    randomUUID: jest.fn(() => 'mock-uuid-123'),
  },
  randomUUID: jest.fn(() => 'mock-uuid-123'),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { comparePasswords } from '../utils/bcrypt.utils';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@email.com',
    passwordHash: 'hashed_password',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
            verifyAsync: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return token and user info on successful login', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any);
      (comparePasswords as jest.Mock).mockResolvedValue(true);

      const result = await service.login('test@email.com', 'password123');

      expect(result).toBeDefined();
      expect(result.token).toBe('mock-jwt-token');
      expect(result.userName).toBe('Test User');
      expect(result.userEmail).toBe('test@email.com');
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any);
      (comparePasswords as jest.Mock).mockResolvedValue(false);

      await expect(service.login('test@email.com', 'wrong_password')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw error when user is not found', async () => {
      jest.spyOn(usersService, 'findByEmail').mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(service.login('test@email.com', 'password123')).rejects.toThrow();
    });
  });

  describe('refreshToken', () => {
    it('should return new token on valid refresh', async () => {
      const mockDecoded = {
        sub: '1',
        name: 'Test User',
        email: 'test@email.com',
      };
      jest.spyOn(jwtService, 'verify').mockReturnValue(mockDecoded as any);
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser as any);

      const result = await service.refreshToken('valid-token');

      expect(result).toBeDefined();
      expect(result.token).toBe('mock-jwt-token');
      expect(result.userName).toBe('Test User');
      expect(result.userEmail).toBe('test@email.com');
    });

    it('should throw UnauthorizedException on invalid token', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle token without sub', async () => {
      const mockDecoded = {
        name: 'Test User',
        email: 'test@email.com',
      };
      jest.spyOn(jwtService, 'verify').mockReturnValue(mockDecoded as any);
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser as any);

      const result = await service.refreshToken('token-without-sub');

      expect(result).toBeDefined();
      expect(result.token).toBe('mock-jwt-token');
    });
  });
});
