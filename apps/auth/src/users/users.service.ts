import { BadRequestException, Injectable, InternalServerErrorException, Logger, UnprocessableEntityException } from '@nestjs/common';
import { CreateUserDto } from '@app/auth/dto/createUser.dto';
import { UserRepository } from './repositories/user.repository';
import * as bcrypt from 'bcrypt';
import { Role } from '@app/auth/dto/role.enum';
import { addMinutes } from 'date-fns';
import { SignupSessionService } from '@app/auth/services/signup-session.service';
import { VerifyPhoneDto } from '@app/auth/dto/verify-phone.dto';
import { TwilioService } from 'libs/common/src/sms/twilio.service';


@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);
    constructor(
        private readonly userRepository: UserRepository,
        private readonly signupSessionService: SignupSessionService,
        private readonly twilioService: TwilioService,
    ) {}
 

    async create(createUserDto: CreateUserDto) {
        
        await this.validateCreateUserDto(createUserDto);

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = addMinutes(new Date(), 5);

        this.signupSessionService.storeSession(
            createUserDto.phoneNumber, 
            createUserDto, 
            verificationCode, 
            expiresAt
        );

        try{
            await this.twilioService.sendSMS(createUserDto.phoneNumber, `Your verification code is ${verificationCode}`);
        

        this.logger.debug(`Verification code for ${createUserDto.phoneNumber}: ${verificationCode}`);

        return {
            message: 'Please verify your phone number with the code sent via SMS',
            expiresIn: '5 minutes'
        };
        } catch (error) {
            this.logger.error(`Failed to send SMS to ${createUserDto.phoneNumber}: ${error.message}`);
            throw new InternalServerErrorException('Failed to send SMS');
        }
    }

    async verifyPhoneAndCompleteSignup(verifyPhoneDto: VerifyPhoneDto){
        const {phoneNumber, otp} = verifyPhoneDto;
        const session = this.signupSessionService.getSession(phoneNumber);
        if(!session){
            throw new BadRequestException('No pending signup found for this phone number');
        }

        if(session.expiresAt < new Date()){
            this.signupSessionService.removeSession(phoneNumber);
            throw new BadRequestException('Verification code expired');
        }

        if(session.phoneVerificationCode !== otp){
            throw new BadRequestException('Invalid verification code');
        }

        const userData = session.userData;
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = await this.userRepository.create({
            ...userData,
            password: hashedPassword,
            roles: [Role.User]
        });

        this.signupSessionService.removeSession(phoneNumber);
        return user;
    }

    private async validateCreateUserDto(createUserDto: CreateUserDto) {

        try{
            const {confirmPassword, ...rest} = createUserDto;
            if(confirmPassword !== rest.password){
                throw new UnprocessableEntityException('Password and confirm password do not match');
            }
            const existingUser = await this.userRepository.findOne({
                email: rest.email,
                phoneNumber: rest.phoneNumber,
                nationalIdNumber: rest.nationalIdNumber
            }, {throwNotFoundException: false})
            if(existingUser){
                throw new UnprocessableEntityException('User already exists');
            }
        } catch (error) {
            throw new UnprocessableEntityException(error.message);
        }
    }
}
