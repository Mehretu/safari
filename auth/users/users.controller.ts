import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../constants';
import { CreateUserDto } from 'auth/auth/dto/createUser.dto';
import { Role } from 'auth/auth/dto/role.enum';

@Controller('users')
export class UsersController {
    constructor(
        private usersService: UsersService
    ) {}

    @Post()
    @Roles(Role.Admin)
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }
}
