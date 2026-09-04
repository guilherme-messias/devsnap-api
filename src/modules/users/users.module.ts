import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/infrastructure/prisma/prisma.module';
import { AuthModule } from '@src/infrastructure/auth/auth.module';
import { CreateUserController } from './controllers/create-user.controller';
import { CreateUserService } from './services/create-user.service';
import { AuthenticateUserService } from './services/authenticate-user.service';
import { AuthenticateUserController } from './controllers/authenticate-user.controller';
import { RefreshUserController } from './controllers/refresh-user.controller';
import { RefreshUserService } from './services/refresh-user.service';
import { LogoutUserController } from './controllers/logout-user.controller';
import { LogoutUserService } from './services/logout-user.service';
import { GetUserProfileService } from './services/get-user-profile.service';
import { GetUserProfileController } from './controllers/get-user-profile.controller';
@Module({
  controllers: [
    CreateUserController,
    AuthenticateUserController,
    RefreshUserController,
    LogoutUserController,
    GetUserProfileController,
  ],
  imports: [PrismaModule, AuthModule],
  providers: [
    CreateUserService,
    AuthenticateUserService,
    RefreshUserService,
    LogoutUserService,
    GetUserProfileService,
  ],
})
export class UsersModule {}
