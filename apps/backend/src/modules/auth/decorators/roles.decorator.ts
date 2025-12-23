import { SetMetadata } from '@nestjs/common';

type UserRole =
  | 'GLOBAL_ADMIN'
  | 'SCHOOL_ADMIN'
  | 'CANTEEN_OPERATOR'
  | 'GUARDIAN'
  | 'STUDENT';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
