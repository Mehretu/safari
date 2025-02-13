import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/createVehicle.dto';
import { CurrentUser } from '@app/common/decorators/current-user.decorator';
import { User } from '@app/auth/users/entities/user.entity';
import { ObjectId } from 'typeorm';

@Controller()
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post('create_vehicle')
  createVehicle(@Body() createVehicleDto: CreateVehicleDto, @CurrentUser() user: User) {
    return this.vehiclesService.createVehicle( user._id.toString(), createVehicleDto);
  } 

  @Get('get_user_vehicles')
  getUserVehicles(@CurrentUser() user: User) {
    return this.vehiclesService.findByUserId(user._id.toString());
  }

  @Get('get_vehicle/:id')
  getVehicle(@Param('id') id: string) {
    return this.vehiclesService.findOne(new ObjectId(id));
  }
}
