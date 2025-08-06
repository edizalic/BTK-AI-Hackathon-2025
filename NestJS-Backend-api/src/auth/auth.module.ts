import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SessionService } from './session.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PassportModule.register({ session: false }),
    UsersModule,
  ],
  providers: [
    AuthService,
    SessionService,
    LocalStrategy,
    JwtStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService, SessionService],
})
export class AuthModule {}