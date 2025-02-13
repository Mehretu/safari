import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { Role } from '@app/auth/dto/role.enum';
import { AbstractEntity } from 'libs/common/src/database/abstract.schema';
import { Matches } from 'class-validator';

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
    @Matches(/^\+251[0-9]{9}$/, {message: 'Invalid phone number'})
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

    @Column({nullable: true})
    resetPasswordToken: string | null;

    @Column({nullable: true})
    resetPasswordTokenExpires: Date | null;

    @Column({default: false})
    isPhoneVerified: boolean;

    @Column({nullable: true})
    phoneVerificationCode: string;

    @Column({nullable: true})
    phoneVerificationCodeExpires: Date;


} 