import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'auth/users/repositories/user.repository';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { SignInDto } from './dto/sign-in.dto';
import * as bcrypt from 'bcrypt';
import { User } from 'auth/users/entities/user.entity';
import { ObjectId } from 'typeorm';
@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    constructor(
        private jwtService: JwtService,
        private userRepository: UserRepository,
        private configService: ConfigService
    ) {}

    async validateUser(email: string, password: string): Promise<User>{
        const user = await this.userRepository.findOne({
            email: email,
        });

        if(!user){
            throw new UnauthorizedException();
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            throw new UnauthorizedException();
        }
        return user;
    }

    async signIn(signInDto: SignInDto, response: Response){

        const user = await this.validateUser(signInDto.username, signInDto.password);

        const payload = { 
            userId: user._id.toHexString(), 
            email: user.email,
            roles: user.roles
        };

        this.logger.debug(`Payload: ${JSON.stringify(payload)}`);

        const expires = new Date();
        expires.setSeconds(
            expires.getSeconds() + this.configService.get('JWT_EXPIRATION'),
        );

        const token = this.jwtService.sign(payload);

        response.cookie('Authentication', token,{
            httpOnly: true,
            expires,
            secure:true,
            sameSite: 'strict'
        });

        return {
            access_token: token,
            requirePasswordChange: user.requirePasswordChange,
            email: user.email,
            roles: user.roles
        };

    }

    async changePassword(email: string, oldPassword: string, newPassword: string){
        const user = await this.userRepository.findOne({
            email: email,
        });

        if(!user){
            throw new UnauthorizedException();
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            this.logger.warn(`Failed password change attempt for user ${email}`);
            throw new UnauthorizedException('Invalid old password');
        }

        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            this.logger.warn(`New password is the same as the old password for user ${email}`);
            throw new BadRequestException('New password cannot be the same as the old password');
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.requirePasswordChange = false;
        user.lastPasswordChange = new Date();
        await this.userRepository.findOneAndUpdate({email: email}, user);
        this.logger.log(`Password changed successfully for user ${email}`);
        return { message: 'Password changed successfully' };
    }
}