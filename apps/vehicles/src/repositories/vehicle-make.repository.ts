import { AbstractRepository } from "@app/common/database/abstract.repository";
import { Injectable, Logger } from "@nestjs/common";
import { VehicleMake } from "../entities/vehicle-make.entity";
import { DataSource } from "typeorm";

@Injectable()
export class VehicleMakeRepository extends AbstractRepository<VehicleMake> {
    protected readonly logger = new Logger(VehicleMakeRepository.name);

    constructor(dataSource: DataSource) {
        super(dataSource.getRepository(VehicleMake));
    }
}