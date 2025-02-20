import { Controller, HttpStatus, HttpCode, Post, Body, UseGuards, Get, Request, Res, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './constants';
import { SignInDto } from './dto/sign-in.dto';
import { Response } from 'express';
import { User } from './users/entities/user.entity';
import { CurrentUser } from 'libs/common/src/decorators/current-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RequestResetPasswordDto, ResetPasswordDto } from './dto/reset-password.dto';
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
            access_token: jwt.access_token,
            requirePasswordChange: jwt.requirePasswordChange,
            email: jwt.email,
            roles: jwt.roles
        };
    }

    @Patch('change-password')
    async changePassword(
        @CurrentUser() user: User,
        @Body() changePasswordDto: ChangePasswordDto,
    ){
        return this.authService.changePassword(
            user.email, 
            changePasswordDto.oldPassword,
            changePasswordDto.newPassword,
        );
    }
    @Post('reset-password-request')
    @Public()
    async requestPasswordReset(
        @Body() requestPasswordResetDto: RequestResetPasswordDto
    ){
        return this.authService.requestResetPassword(requestPasswordResetDto.email);
    }

    @Post('reset-password')
    @Public()
    async resetPassword(
        @Body() resetPasswordDto: ResetPasswordDto
    ){
        return this.authService.resetPassword(resetPasswordDto);
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
