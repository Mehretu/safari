import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserRepository } from './repositories/user.repository';
import { DataSource } from 'typeorm';
import { DatabaseModule } from 'libs/common/src/database/database.module';
import { SmsModule } from 'libs/common/src/sms/sms.module';
import { SignupSessionService } from '@app/auth/services/signup-session.service';

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
