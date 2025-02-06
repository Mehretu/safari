import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'auth/users/repositories/user.repository';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { SignInDto } from './dto/sign-in.dto';
import * as bcrypt from 'bcrypt';
import { User } from 'auth/users/entities/user.entity';
@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    constructor(
        private jwtService: JwtService,
        private userRepository: UserRepository,
        private configService: ConfigService
    ) {}

    async validateUser(username: string, password: string): Promise<User>{
        const user = await this.userRepository.findOne({
            username: username,
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
            username: user.username,
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

        return token;

    }
}