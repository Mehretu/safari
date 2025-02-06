import { Injectable, CanActivate, ExecutionContext, Logger, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './src/dto/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
    private readonly logger = new Logger(RolesGuard.name);

    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);

        this.logger.debug('RolesGuard executing');
        this.logger.debug(`Required roles: ${JSON.stringify(requiredRoles)}`);

        if (!requiredRoles) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();
        this.logger.debug(`User data: ${JSON.stringify(user)}`);

        if (!user || !user.roles) {
            this.logger.debug('No user or roles found');
            throw new ForbiddenException('No roles available');
        }

        const hasRole = requiredRoles.some((role) => 
            user.roles.includes(role)
        );

        this.logger.debug(`Has required role: ${hasRole}`);

        if (!hasRole) {
            throw new ForbiddenException('Insufficient permissions');
        }

        return hasRole;
    }
}
