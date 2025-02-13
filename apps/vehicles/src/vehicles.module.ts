import { Module } from '@nestjs/common';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { DatabaseModule } from '@app/common/database/database.module';
import { VehicleRepository } from './repositories/vehicle.repository';

@Module({
  imports: [
    DatabaseModule,
  ],
  controllers: [VehiclesController],
  providers: [VehiclesService, VehicleRepository],
})
export class VehiclesModule {}
