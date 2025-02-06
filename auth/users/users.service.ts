import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateUserDto } from 'auth/auth/dto/createUser.dto';
import { UserRepository } from './repositories/user.repository';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UsersService {
    // private readonly users: User[] = [
    //     {
    //         id: 1,
    //         username: 'john',
    //         password: 'changeme',
    //         roles: [Role.User],
    //     },
    //     {
    //         id: 2,
    //         username: 'maria',
    //         password: 'guess',
    //         roles: [Role.Admin],
    //     },
    // ];

    constructor(private readonly userRepository: UserRepository) {}
 

    async create(createUserDto: CreateUserDto) {
        await this.validateCreateUserDto(createUserDto);
        return this.userRepository.create({
            ...createUserDto,
            password: await bcrypt.hash(createUserDto.password, 10),
        })
        
    }

    private async validateCreateUserDto(createUserDto: CreateUserDto) {
        try{
            await this.userRepository.findOne({
                username: createUserDto.username
            })
        } catch (error) {
            return;
        }
        throw new UnprocessableEntityException('Username already exists');
    }
}
