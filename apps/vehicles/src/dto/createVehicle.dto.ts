import { IsNumber, IsString, Matches, Max, Min } from "class-validator";

export class CreateVehicleDto {
    @IsString()
    make: string;

    @IsString()
    model: string;

    @IsNumber()
    @Min(1900)
    @Max(new Date().getFullYear() + 1)
    year: number;

    @IsString()
    color: string;

    @IsString()
    @Matches(/^[A-Z]{2}-\d{5}$/, {message: 'License plate number must be in the format of XX-XXXXX'})
    licensePlateNumber: string;

    @IsString()
    registrationNumber: string;

    @IsString()
    insurancePolicyNumber: string;
}