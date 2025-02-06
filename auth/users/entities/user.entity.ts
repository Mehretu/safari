import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { Role } from '../../auth/dto/role.enum';
import { AbstractEntity } from 'libs/common/src/abstract.schema';

@Entity('users')
export class User extends AbstractEntity {
    

    @Column({ unique: true })
    username: string;

    @Column()
    password: string;

    @Column({ unique: true })
    email: string;

    @Column()
    nationalIdNumber: string;

    @Column()
    phoneNumber: string;

    @Column()
    city: string;

    @Column({
        type: 'enum',
        enum: Role,
        default: [Role.User]
    })
    roles: Role[];

    @Column({ default: true })
    isActive: boolean;


} 