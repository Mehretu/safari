import { IsNotEmpty, IsString, Length, Matches } from "class-validator";

export class SendPhoneVerificationDto {
    @IsString()
    @Matches(/^\+251[0-9]{9}$/,
    {
        message: 'Phone number must be a valid Ethiopian phone number'
    }
    )
    phoneNumber: string;
}

export class VerifyPhoneDto {
    @IsString()
    @Length(6, 6)
    otp: string;

    @IsString()
    @Matches(/^\+251[0-9]{9}$/)
    phoneNumber: string;
}