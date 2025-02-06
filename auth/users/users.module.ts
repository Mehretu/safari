import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from 'auth/roles.guard';
import { UserRepository } from './repositories/user.repository';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';

@Module({
  providers: [
    UsersService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: UserRepository,
      useFactory: (dataSource: DataSource) => {
        return new UserRepository(dataSource.getRepository(User));
      },
      inject: [DataSource],
    }
  ],
  exports: [UsersService, UserRepository],
  controllers: [UsersController]
})
export class UsersModule {}
