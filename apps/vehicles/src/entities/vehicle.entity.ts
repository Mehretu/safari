import { AbstractEntity } from "@app/common/database/abstract.schema";
import { Column, Entity } from "typeorm";
@Entity('vehicles')
export class Vehicle extends AbstractEntity {
    @Column()
    userId: string;
    
    @Column()
    make: string;

    @Column()
    model: string;

    @Column()
    year: number;

    @Column()
    color: string;

    @Column()
    licensePlateNumber: string;

    @Column()
    registrationNumber: string;

    @Column()
    insurancePolicyNumber: string;
}