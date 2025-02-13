import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger, UnprocessableEntityException } from '@nestjs/common';
import { CreateUserDto } from '@app/auth/dto/createUser.dto';
import { UserRepository } from './repositories/user.repository';
import * as bcrypt from 'bcrypt';
import { Role } from '@app/auth/dto/role.enum';
import { addMinutes } from 'date-fns';
import { SignupSessionService } from '@app/auth/services/signup-session.service';
import { CompleteSignupDto, VerifyPhoneDto } from '@app/auth/dto/verify-phone.dto';
import { TwilioService } from 'libs/common/src/sms/twilio.service';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';


@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);
    constructor(
        private readonly userRepository: UserRepository,
        private readonly signupSessionService: SignupSessionService,
        private readonly twilioService: TwilioService,
        @Inject('VEHICLE_SERVICE') private readonly vehicleClient: ClientProxy
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
            await this.twilioService.sendSMS(
                createUserDto.phoneNumber, 
                `Your verification code is ${verificationCode}`);
        

        this.logger.debug(`Verification code for ${createUserDto.phoneNumber}: ${verificationCode}`);

        const makes = await firstValueFrom(
            this.vehicleClient.send('get-vehicle-makes', {})
        )

        return {
            message: 'Please verify your phone number with the code sent via SMS',
            expiresIn: '5 minutes',
            makes
        };
        } catch (error) {
            this.logger.error(`Failed to send SMS to ${createUserDto.phoneNumber}: ${error.message}`);
            throw new InternalServerErrorException('Failed to send SMS');
        }
    }

    async getVehicleModels(makeId: string){
        return firstValueFrom(
            this.vehicleClient.send('get-vehicle-models', {makeId})
        )
    }

    async verifyPhoneAndCompleteSignup(completeSignupDto: CompleteSignupDto){
        const {phoneNumber, otp, vehicleData, documents} = completeSignupDto;
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
        const uploadedDocuments = await this.uploadDocuments(documents);
        const user = await this.userRepository.create({
            ...userData,
            password: hashedPassword,
            roles: [Role.User],
            documents: {
                driversLicense: {
                    front: uploadedDocuments.driverLicenseFront,
                    back: uploadedDocuments.driverLicenseBack
                },
                nationalId: {
                    front: uploadedDocuments.nationalIdFront,
                    back: uploadedDocuments.nationalIdBack
                },
                vehicleInsurance: uploadedDocuments.vehicleInsurance,
                vehicleRegistration: uploadedDocuments.vehicleRegistration
            }
        });

        await firstValueFrom(
            this.vehicleClient.send('create_vehicle_for_user', {
                userId: user._id,
                vehicleData
            })
        );



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
