import { IsNotEmpty, IsNumber, IsObject, IsString, Length, Matches, Max, Min, ValidateNested } from "class-validator";
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


export class VehicleDataDto {
    @IsString()
    @IsNotEmpty()
    makeId: string;

    @IsString()
    @IsNotEmpty()
    modelId: string;

    @IsNumber()
    @Min(1900)
    @Max(new Date().getFullYear() + 1)
    year: number;

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


