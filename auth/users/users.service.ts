import { Injectable } from '@nestjs/common';
import { User } from './interfaces/user.interface';
import { Role } from 'auth/auth/dto/role.enum';


@Injectable()
export class UsersService {
    private readonly users: User[] = [
        {
            id: 1,
            username: 'john',
            password: 'changeme',
            roles: [Role.User],
        },
        {
            id: 2,
            username: 'maria',
            password: 'guess',
            roles: [Role.Admin],
        },
    ];
    async findOne(username: string): Promise<User | undefined> {
        return this.users.find(user => user.username === username);
    }

    async create(user: User): Promise<User> {
        this.users.push(user);
        return user;
    }
}