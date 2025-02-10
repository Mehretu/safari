import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { Role } from '../../../auth/src/dto/role.enum';
import { AbstractEntity } from 'libs/common/src/database/abstract.schema';

@Entity('users')
export class User extends AbstractEntity {
    

    @Column()
    firstName: string;

    @Column()
    lastName: string;

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

    @Column({default: false})
    requirePasswordChange: boolean;

    @Column({nullable: true})
    lastPasswordChange: Date;


} 