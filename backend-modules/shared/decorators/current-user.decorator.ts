import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtUserContext {
  sub: string;
  email?: string;
  role?: string;
  username?: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtUserContext | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: JwtUserContext }>();
    return request.user;
  },
);
