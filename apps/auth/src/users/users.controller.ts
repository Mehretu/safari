import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { Public, Roles } from '../constants';
import { CreateUserDto } from '@app/auth/dto/createUser.dto';
import { Role } from '@app/auth/dto/role.enum';
import { CurrentUser } from 'libs/common/src/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { VerifyPhoneDto } from '@app/auth/dto/verify-phone.dto';

@Controller('users')
export class UsersController {
    constructor(
        private usersService: UsersService
    ) {}

    @Post()
    // @Roles(Role.User)
    @Public()
    async create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Post('verify-phone')
    @Public()
    async verifyPhone(@Body() verifyPhoneDto: VerifyPhoneDto){
        return this.usersService.verifyPhoneAndCompleteSignup(verifyPhoneDto);
    }

    @Get()
    @Roles(Role.Admin)
    async getUser(@CurrentUser() user: User) {
        return user;
    }

    @Get('vehicle-models/:makeId')
    @Public()
    async getVehicleModels(@Param('makeId') makeId: string){
        return this.usersService.getVehicleModels(makeId);
    }
}