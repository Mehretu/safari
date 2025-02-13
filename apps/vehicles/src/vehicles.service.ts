import { Injectable } from '@nestjs/common';
import { CreateVehicleDto } from './dto/createVehicle.dto';
import { VehicleRepository } from './repositories/vehicle.repository';
import { ObjectId } from 'typeorm';
import { VehicleMakeRepository } from './repositories/vehicle-make.repository';
import { VehicleModelRepository } from './repositories/vehicle-model.repository';
import { VehicleModel } from './entities/vehicle-model.entity';

@Injectable()
export class VehiclesService {
  constructor(
    private readonly vehicleRepository: VehicleRepository,
    private readonly vehicleMakeRepository: VehicleMakeRepository,
    private readonly vehicleModelRepository: VehicleModelRepository
  ) {}
  async createVehicleForUser(userId: string, createVehicleDto: CreateVehicleDto) {
    const vehicle = await this.vehicleRepository.create({
      ...createVehicleDto,
      userId
    });
    return vehicle;
  }

  async findByUserId(userId: string) {
    return this.vehicleRepository.find({
      
        userId
      
    });
  }

  async findOne(id: ObjectId) {
    const vehicle = await this.vehicleRepository.findOne({
        
            _id: id  
    });

    return vehicle;
  }

  async getAllMakes() {
    return this.vehicleMakeRepository.find({})
  }

  async getModelsByMakeId(makeId: string) : Promise<VehicleModel[]>{
    return this.vehicleModelRepository.find({
      
        make: {_id: new ObjectId(makeId)}
      
    })
  }

}