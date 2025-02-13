import { IsNotEmpty, IsObject, IsString, Length, Matches, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class SendPhoneVerificationDto {
    @IsString()
    @Matches(/^\+251[0-9]{9}$/,
    {
        message: 'Phone number must be a valid Ethiopian phone number'
    }
    )
    phoneNumber: string;
}

export class CompleteSignupDto {
    
    @IsString()
    @Length(6, 6)
    otp: string;

    @IsString()
    @Matches(/^\+251[0-9]{9}$/)
    phoneNumber: string;

    @IsObject()
    @ValidateNested()
    @Type(() => DocumentsDto)
    documents: DocumentsDto;

    @IsObject()
    @ValidateNested()
    @Type(() => VehicleDataDto)
    vehicleData: VehicleDataDto;

}

export class VehicleDataDto {
    @IsString()
    @IsNotEmpty()
    makeId: string;

    @IsString()
    @IsNotEmpty()
    modelId: string;

    @IsString()
    @IsNotEmpty()
    year: string;

    @IsString()
    @IsNotEmpty()
    color: string;

    @IsString()
    @IsNotEmpty()
    licensePlateNumber: string;

    @IsString()
    @IsNotEmpty()
    registrationNumber: string;

    @IsString()
    @IsNotEmpty()
    insurancePolicyNumber: string;
}

export class DocumentsDto {
    @IsString()
    @IsNotEmpty()
    driverLicenseFront: string;

    @IsString()
    @IsNotEmpty()
    driverLicenseBack: string;

    @IsString()
    @IsNotEmpty()
    nationalIdFront: string;

    @IsString()
    @IsNotEmpty()
    nationalIdBack: string;

    @IsString()
    @IsNotEmpty()
    vehicleInsurance: string;

    @IsString()
    @IsNotEmpty()
    vehicleRegistration: string;

}

