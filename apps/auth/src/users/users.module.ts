import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserRepository } from './repositories/user.repository';
import { DataSource } from 'typeorm';
import { DatabaseModule } from 'libs/common/src/database/database.module';
import { SmsModule } from 'libs/common/src/sms/sms.module';
import { SignupSessionService } from '@app/auth/services/signup-session.service';
import { MinioModule } from '@app/common/storage/minio.module';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    DatabaseModule,
    SmsModule,
    MinioModule
  ],
  providers: [
    UsersService,
    SignupSessionService,
    {
      provide: UserRepository,
      useFactory: (dataSource: DataSource) => {
        return new UserRepository(dataSource);
      },
      inject: [DataSource],
    },
    {
      provide: 'VEHICLE_SERVICE',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: configService.get('VEHICLE_SERVICE_HOST'),
            port: configService.get('VEHICLE_SERVICE_PORT'),
          },
        });
      },
      inject: [ConfigService],
    },
    
  ],
  exports: [UsersService, UserRepository],
  controllers: [UsersController]
})
export class UsersModule {}
