import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger, UnprocessableEntityException } from '@nestjs/common';
import { CreateUserDto } from '@app/auth/dto/createUser.dto';
import { UserRepository } from './repositories/user.repository';
import * as bcrypt from 'bcrypt';
import { Role } from '@app/auth/dto/role.enum';
import { addMinutes } from 'date-fns';
import { SignupSessionService } from '@app/auth/services/signup-session.service';
import { CompleteSignupDto, DocumentsDto } from '@app/auth/dto/verify-phone.dto';
import { TwilioService } from 'libs/common/src/sms/twilio.service';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { MinioService } from '@app/common/storage/minio.service';
import { BufferedFile } from '@app/common/storage/file.model';


@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);
    constructor(
        private readonly userRepository: UserRepository,
        private readonly signupSessionService: SignupSessionService,
        private readonly twilioService: TwilioService,
        private readonly minioService: MinioService,
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
        try{
            return await firstValueFrom(
                this.vehicleClient.send('get-vehicle-models', {makeId})
            )
        } catch (error) {
            this.logger.error(`Failed to get vehicle models for make ${makeId}: ${error.message}`);
            throw new InternalServerErrorException('Failed to get vehicle models');
        }
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

       try{
        await firstValueFrom(
            this.vehicleClient.send('create_vehicle_for_user', {
                userId: user._id,
                vehicleData
            })
        );
       } catch (error) {
        this.logger.error(`Failed to create vehicle for user ${user._id}: ${error.message}`);
        throw new InternalServerErrorException('Failed to create vehicle');
       }



        this.signupSessionService.removeSession(phoneNumber);
        return user;
    }
    private async uploadDocuments(documents: DocumentsDto): Promise<any>{

        try{

            const uploadPromises: Promise<[string, string]>[] = [];
            if(documents.driverLicenseFront){
                uploadPromises.push(
                    this.minioService.upload(
                        this.convertBase64ToBuffer(documents.driverLicenseFront),
                        'driver-license-front'
                    ).then((url): [string, string] => ['driverLicenseFront', url])
                );
            }
            if(documents.driverLicenseBack){
                uploadPromises.push(
                    this.minioService.upload(
                        this.convertBase64ToBuffer(documents.driverLicenseBack),
                        'driver-license-back'
                    ).then((url): [string, string] => ['driverLicenseBack', url])
                );
            }
            if(documents.nationalIdFront){
                uploadPromises.push(
                    this.minioService.upload(
                        this.convertBase64ToBuffer(documents.nationalIdFront),
                        'national-id-front'
                    ).then((url): [string, string] => ['nationalIdFront', url])
                );
            }
            if(documents.nationalIdBack){
                uploadPromises.push(
                    this.minioService.upload(
                        this.convertBase64ToBuffer(documents.nationalIdBack),
                        'national-id-back'
                    ).then((url): [string, string] => ['nationalIdBack', url])
                );
            }
            if(documents.vehicleInsurance){
                uploadPromises.push(
                    this.minioService.upload(
                        this.convertBase64ToBuffer(documents.vehicleInsurance),
                        'vehicle-insurance'
                    ).then((url): [string, string] => ['vehicleInsurance', url])
                );
            }
            if(documents.vehicleRegistration){
                uploadPromises.push(
                    this.minioService.upload(
                        this.convertBase64ToBuffer(documents.vehicleRegistration),
                        'vehicle-registration'
                    ).then((url): [string, string] => ['vehicleRegistration', url])
                );
            }

            const uploadedDocuments = await Promise.all(uploadPromises);
            return Object.fromEntries(uploadedDocuments);
        } catch (error) {
            this.logger.error(`Failed to upload documents: ${error.message}`);
            throw new InternalServerErrorException('Failed to upload documents');
        }
    }

    private convertBase64ToBuffer(base64String: string): BufferedFile{
        const matches = base64String.match(/^data:(.+);base64,(.+)$/);
        if(!matches) throw new BadRequestException('Invalid base64 string');

        const [, mimeType, data] = matches;
        const fileBuffer = Buffer.from(data, 'base64');
        const file = {
            fieldname: 'file',
            originalname: `${Date.now()}-${Math.random()}.${mimeType.split('/')[1]}`,
            encoding: '7bit',
            mimetype: mimeType,
            size: fileBuffer.length,
            buffer: fileBuffer
        }
        return file;
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
