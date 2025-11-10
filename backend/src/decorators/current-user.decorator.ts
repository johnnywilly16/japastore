import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.sub) {
      throw new Error('User not found in request. Make sure AuthGuard is applied.');
    }

    // user.sub is the user ID from JWT
    return parseInt(user.sub, 10);
  },
);

