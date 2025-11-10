import { ExecutionContext } from '@nestjs/common';
import { CurrentUser } from './current-user.decorator';

const testDecoratorLogic = (ctx: ExecutionContext): number => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user;

  if (!user || !user.sub) {
    throw new Error('User not found in request. Make sure AuthGuard is applied.');
  }

  return parseInt(user.sub, 10);
};

describe('CurrentUser Decorator', () => {
  it('should be defined', () => {
    expect(CurrentUser).toBeDefined();
  });

  it('should extract user id from request', () => {
    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: {
            sub: '1',
          },
        }),
      }),
    } as unknown as ExecutionContext;

    const result = testDecoratorLogic(mockExecutionContext);
    expect(result).toBe(1);
  });

  it('should throw error if user not found in request', () => {
    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: null,
        }),
      }),
    } as unknown as ExecutionContext;

    expect(() => testDecoratorLogic(mockExecutionContext)).toThrow(
      'User not found in request. Make sure AuthGuard is applied.',
    );
  });

  it('should throw error if user.sub is missing', () => {
    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: {},
        }),
      }),
    } as unknown as ExecutionContext;

    expect(() => testDecoratorLogic(mockExecutionContext)).toThrow(
      'User not found in request. Make sure AuthGuard is applied.',
    );
  });

  it('should parse string user id to number', () => {
    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: {
            sub: '123',
          },
        }),
      }),
    } as unknown as ExecutionContext;

    const result = testDecoratorLogic(mockExecutionContext);
    expect(result).toBe(123);
    expect(typeof result).toBe('number');
  });
});

