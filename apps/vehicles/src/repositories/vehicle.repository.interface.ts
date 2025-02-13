import { CreateVehicleDto } from "../dto/createVehicle.dto";
import { Vehicle } from "../entities/vehicle.entity";

export interface IVehicleRepository {
    create(vehicleData: CreateVehicleDto): Promise<Vehicle>;
    findByUserId(userId: string): Promise<Vehicle[]>;
    findOne(id: string): Promise<Vehicle | undefined>;
}