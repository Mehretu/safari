import { Controller, HttpStatus, HttpCode, Post, Body, UseGuards, Get, Request, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../constants';
import { SignInDto } from './dto/sign-in.dto';
import { Response } from 'express';
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ) {}

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async signIn(
        @Body() signInDto: SignInDto,
        @Res({passthrough: true}) response: Response) {
        const jwt = await this.authService.signIn(signInDto,response);
        return {
            access_token: jwt,
        };
    }

    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }

    @Public()
    @Get()
    findAll() {
        return 'this is public route';
    }

}
