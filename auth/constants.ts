import { SetMetadata } from "@nestjs/common";
import { Role } from "./auth/dto/role.enum";

export const jwtConstants = {
    secret: 'this is vvssdr18p15 secret key',
};

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

