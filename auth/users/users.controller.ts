import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { Public, Roles } from '../constants';
import { CreateUserDto } from 'auth/src/dto/createUser.dto';
import { Role } from 'auth/src/dto/role.enum';
import { CurrentUser } from 'libs/common/src/decorators/current-user.decorator';
import { User } from './entities/user.entity';

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

    @Get()
    @Roles(Role.Admin)
    async getUser(@CurrentUser() user: User) {
        return user;
    }
}
