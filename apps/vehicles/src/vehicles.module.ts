import { Module } from '@nestjs/common';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { DatabaseModule } from '@app/common/database/database.module';
import { VehicleRepository } from './repositories/vehicle.repository';
import { VehicleMakeRepository } from './repositories/vehicle-make.repository';
import { VehicleModelRepository } from './repositories/vehicle-model.repository';

@Module({
  imports: [
    DatabaseModule,
  ],
  controllers: [VehiclesController],
  providers: [VehiclesService, VehicleRepository, VehicleMakeRepository, VehicleModelRepository],
})
export class VehiclesModule {}
