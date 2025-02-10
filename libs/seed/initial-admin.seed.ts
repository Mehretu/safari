import { DataSource } from 'typeorm';
import { User } from '../../auth/users/entities/user.entity';
import { Role } from '../../auth/src/dto/role.enum';
import * as bcrypt from 'bcrypt';
import { Logger } from '@nestjs/common';

const logger = new Logger('InitialAdminSeed');

export const createInitialAdmin = async (dataSource: DataSource) => {
    const userRepository = dataSource.getRepository(User);
    
    const adminExists = await userRepository.findOne({ 
        where: { email: 'admin@example.com' } 
    });

    if (!adminExists) {
        logger.log('Creating initial admin user...');

        const adminUser = userRepository.create({
            firstName: 'Admin',
            lastName: 'Admin',
            password: await bcrypt.hash('admin123', 10), 
            email: 'admin@example.com',
            roles: [Role.Admin],
            nationalIdNumber: 'ADMIN001',
            phoneNumber: 'ADMIN001',
            city: 'AdminCity',
            isActive: true,
            requirePasswordChange: true        
        });
        await userRepository.save(adminUser);
        logger.log('Initial admin user created', adminUser);

    }
};