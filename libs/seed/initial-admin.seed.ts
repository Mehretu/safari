import { DataSource } from 'typeorm';
import { User } from '../../auth/users/entities/user.entity';
import { Role } from '../../auth/src/dto/role.enum';
import * as bcrypt from 'bcrypt';

export const createInitialAdmin = async (dataSource: DataSource) => {
    const userRepository = dataSource.getRepository(User);
    
    const adminExists = await userRepository.findOne({ 
        where: { username: 'admin' } 
    });

    if (!adminExists) {
        const adminUser = userRepository.create({
            username: 'admin',
            password: await bcrypt.hash('admin123', 10), 
            email: 'admin@example.com',
            roles: [Role.Admin],
            nationalIdNumber: 'ADMIN001',
            phoneNumber: 'ADMIN001',
            city: 'AdminCity',
            isActive: true
        });

        await userRepository.save(adminUser);
        console.log('Initial admin user created');
    }
};