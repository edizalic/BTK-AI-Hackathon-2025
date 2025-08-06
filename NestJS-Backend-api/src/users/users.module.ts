import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';

@Module({
  providers: [UsersService, ProfileService],
  controllers: [UsersController, ProfileController],
  exports: [UsersService, ProfileService],
})
export class UsersModule {}