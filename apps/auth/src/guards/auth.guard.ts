import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from 'express';
import { IS_PUBLIC_KEY } from "../constants";
import { Reflector } from "@nestjs/core";

@Injectable()
export class AuthGuard implements CanActivate {
    private readonly logger = new Logger(AuthGuard.name);
    
    constructor(
        private jwtService: JwtService, 
        private reflector: Reflector
    ){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        this.logger.debug(`Is public route: ${isPublic}`);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        
        // Log raw headers for debugging
        this.logger.debug('Raw headers:', request.headers);
        
        // Try different ways to get the token
        const token = 
            request.cookies?.Authentication || 
            request.signedCookies?.Authentication ||
            request.headers.cookie?.split(';')
                .find(c => c.trim().startsWith('Authentication='))
                ?.split('=')[1];

        this.logger.debug(`Token found: ${!!token}`);

        if (!token) {
            throw new UnauthorizedException('No token found in cookies');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token);
            this.logger.debug(`JWT Payload: ${JSON.stringify(payload)}`);

            request['user'] = payload;
            return true;
        } catch (error) {
            this.logger.error(`Auth failed: ${error.message}`);
            throw new UnauthorizedException();
        }
    }
}