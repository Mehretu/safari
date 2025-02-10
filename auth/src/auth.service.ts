import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'auth/users/repositories/user.repository';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { SignInDto } from './dto/sign-in.dto';
import * as bcrypt from 'bcrypt';
import { User } from 'auth/users/entities/user.entity';
import { randomBytes } from 'crypto';
import { addHours } from 'date-fns';
import { MailerService } from '@nestjs-modules/mailer';
import { ResetPasswordDto } from './dto/reset-password.dto';
@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    constructor(
        private jwtService: JwtService,
        private userRepository: UserRepository,
        private configService: ConfigService,
        private mailService: MailerService
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

        const user = await this.validateUser(signInDto.email, signInDto.password);

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

    async requestResetPassword(email: string) {
        try {
            this.logger.debug(`Attempting password reset for email: ${email}`);
            
            const user = await this.userRepository.findOne(
                {email},
                {throwNotFoundException: false}
            );

            if(!user) {
                this.logger.debug('User not found');
                return {message: 'If an account exists with this email, a password reset email will be sent.'};
            }

            this.logger.debug('User found, generating reset token');
            const resetToken = Math.floor(100000 + Math.random() * 900000).toString();            const resetTokenExpires = addHours(new Date(), 1);

            user.resetPasswordToken = resetToken;
            user.resetPasswordTokenExpires = resetTokenExpires;
            await this.userRepository.create(user);

            this.logger.debug('Attempting to send mail');
            try {
                await this.mailService.sendMail({
                    to: user.email,
                    subject: 'Password Reset Code',
                    template: 'reset-password',
                    context: {
                        name: `${user.firstName} ${user.lastName}`,
                        resetToken: resetToken,
                        resetTokenExpires: resetTokenExpires
                    }
                });
                this.logger.debug('Reset email sent successfully');
            } catch (error) {
                this.logger.error('Mail sending failed:', error);
                throw error;
            }

            return {message: 'If an account exists with this email, a password reset email will be sent.'};
        } catch (error) {
            this.logger.error('Password reset request failed:', error);
            throw error;
        }
    }
    async resetPassword(resetPasswordDto: ResetPasswordDto){
        const {token, newPassword, confirmPassword} = resetPasswordDto;

        if(newPassword !== confirmPassword){
            throw new BadRequestException('New password and confirm password do not match');
        }

        const user = await this.userRepository.findOne(
            {
                resetPasswordToken: token,
                resetPasswordTokenExpires: { 
                    $gte: new Date() 
                } as any
            }, 
        { throwNotFoundException: false});

        if(!user){
            throw new BadRequestException('Invalid or expired reset token');
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = null;
        user.resetPasswordTokenExpires = null;
        user.lastPasswordChange = new Date();
        await this.userRepository.create(user);
        return { message: 'Password reset successful'};

    }
}