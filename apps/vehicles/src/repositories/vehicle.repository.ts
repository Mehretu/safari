import { AbstractRepository } from "@app/common/database/abstract.repository";
import { Vehicle } from "../entities/vehicle.entity";
import { Injectable, Logger } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class VehicleRepository extends AbstractRepository<Vehicle> {
    protected readonly logger = new Logger(VehicleRepository.name);

    constructor(dataSource: DataSource) {
        super(dataSource.getRepository(Vehicle));
    }
}