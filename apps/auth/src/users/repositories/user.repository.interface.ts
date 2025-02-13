import { User } from '../entities/user.entity';
import { CreateUserDto } from '../../dto/createUser.dto';

export interface IUserRepository {
    findOne(username: string): Promise<User | undefined>;
    create(userData: CreateUserDto): Promise<User>;
    findById(id: string): Promise<User | undefined>;
    findByEmail(email: string): Promise<User | undefined>;
} 