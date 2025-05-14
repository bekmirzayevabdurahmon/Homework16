import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { ROLES_KEY } from 'src/decorators';
import { UserRoles } from 'src/modules/user/enums';

  @Injectable()
  export class CheckRolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
  
canActivate(
  context: ExecutionContext,
): boolean | Promise<boolean> | Observable<boolean> {
  const ctx = context.switchToHttp();
  const request = ctx.getRequest<Request & { role?: UserRoles; userId?: string }>();

  const roles = this.reflector.getAllAndOverride<UserRoles[]>(ROLES_KEY, [
    context.getHandler(),
    context.getClass(),
  ]);

  // Agar route uchun hech qanday rol belgilanmagan bo‘lsa, ruxsat beriladi
  if (!roles || roles.length === 0) {
    return true;
  }

  // Foydalanuvchi roli aniqlanmagan bo‘lsa
  if (!request.role) {
    throw new ForbiddenException('Foydalanuvchi roli aniqlanmadi');
  }

  const userRole = request.role;

  // Foydalanuvchi roli ruxsat etilganlar ichida yo‘q bo‘lsa
  if (!roles.includes(userRole)) {
    throw new ForbiddenException('Siz bu amalni bajara olmaysiz');
  }

  return true;
 }
}
