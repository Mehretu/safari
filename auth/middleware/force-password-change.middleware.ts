import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ForcePasswordChangeMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const user = req.user as any;
        
        if (user?.requirePasswordChange && 
            !req.path.includes('/auth/change-password')) {
            throw new UnauthorizedException(
                'Password change required before continuing'
            );
        }
        
        next();
    }
} 