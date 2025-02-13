import { Injectable } from '@nestjs/common';
import { CreateVehicleDto } from './dto/createVehicle.dto';
import { VehicleRepository } from './repositories/vehicle.repository';
import { ObjectId } from 'typeorm';

@Injectable()
export class VehiclesService {
  constructor(private readonly vehicleRepository: VehicleRepository) {}
  async createVehicle(userId: string, createVehicleDto: CreateVehicleDto) {
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

}