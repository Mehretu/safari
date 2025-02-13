import { AbstractEntity } from "@app/common/database/abstract.schema";
import { Column, Entity, ManyToOne } from "typeorm";
import { VehicleMake } from "./vehicle-make.entity";

@Entity()
export class VehicleModel extends AbstractEntity{
    @Column()
    name: string;

    @Column('int', {array: true})
    availableYears: number[];

    @ManyToOne(() => VehicleMake, make => make.models)
    make: VehicleMake;
    
}