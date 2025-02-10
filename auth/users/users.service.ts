import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateUserDto } from 'auth/src/dto/createUser.dto';
import { UserRepository } from './repositories/user.repository';
import * as bcrypt from 'bcrypt';
import { Role } from 'auth/src/dto/role.enum';


@Injectable()
export class UsersService {
    constructor(private readonly userRepository: UserRepository) {}
 

    async create(createUserDto: CreateUserDto) {
        
        await this.validateCreateUserDto(createUserDto);
        return this.userRepository.create({
            ...createUserDto,
            password: await bcrypt.hash(createUserDto.password, 10),
            roles: [Role.User]
        })
        
    }

    private async validateCreateUserDto(createUserDto: CreateUserDto) {

        try{
            const {confirmPassword, ...rest} = createUserDto;
            if(confirmPassword !== rest.password){
                throw new UnprocessableEntityException('Password and confirm password do not match');
            }
            const existingUser = await this.userRepository.findOne({
                email: rest.email,
                phoneNumber: rest.phoneNumber,
                nationalIdNumber: rest.nationalIdNumber
            }, {throwNotFoundException: false})
            if(existingUser){
                throw new UnprocessableEntityException('User already exists');
            }
        } catch (error) {
            throw new UnprocessableEntityException(error.message);
        }
    }
}
