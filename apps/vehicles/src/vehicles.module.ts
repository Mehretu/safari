import { Module } from '@nestjs/common';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';

@Module({
  imports: [],
  controllers: [VehiclesController],
  providers: [VehiclesService],
})
export class VehiclesModule {}
