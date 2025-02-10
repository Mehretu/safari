import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    firstName: string

    @IsString()
    @IsNotEmpty()
    lastName: string

    @IsEmail()
    @IsNotEmpty()
    email: string

    @IsString()
    @MinLength(8)
    password: string;

    @IsString()
    @MinLength(8)
    confirmPassword: string;

    @IsString()
    @Matches(/^\+251[0-9]{9}$/, {message: 'Invalid phone number'})
    phoneNumber: string;

    @IsString()
    @IsNotEmpty()
    nationalIdNumber: string;

    @IsString()
    @IsNotEmpty()
    city: string;

}