import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from 'auth/roles.guard';
import { UserRepository } from './repositories/user.repository';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { DatabaseModule } from 'libs/common/src/database/database.module';
import { SmsModule } from 'libs/common/src/sms/sms.module';
import { SignupSessionService } from 'auth/src/services/signup-session.service';
import { LoggerModule } from 'libs/common/src/logger/logger.module';

@Module({
  imports: [
    DatabaseModule,
    SmsModule,
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
    
  ],
  exports: [UsersService, UserRepository],
  controllers: [UsersController]
})
export class UsersModule {}
