import { AbstractEntity } from "@app/common/database/abstract.schema";
import { Column, OneToMany } from "typeorm";
import { VehicleModel } from "./vehicle-model.entity";

export class VehicleMake extends AbstractEntity {

    @Column()
    name: string;

    @Column()
    country: string;

    @Column()
    logoUrl: string;

    @OneToMany(() => VehicleModel, model => model.make)
    models: VehicleModel[];


}
