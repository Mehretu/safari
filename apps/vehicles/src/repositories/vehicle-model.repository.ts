import { Injectable, Logger } from "@nestjs/common";
import { VehicleModel } from "../entities/vehicle-model.entity";
import { DataSource } from "typeorm";
import { AbstractRepository } from "@app/common/database/abstract.repository";

@Injectable()
export class VehicleModelRepository extends AbstractRepository<VehicleModel> {
    protected readonly logger = new Logger(VehicleModelRepository.name);

    constructor(dataSource: DataSource) {
        super(dataSource.getRepository(VehicleModel));
    }
}