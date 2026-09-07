import { Module } from '@nestjs/common';
import { PrismaModule } from '@infrastructure/prisma/prisma.module';
import { AuthModule } from '@infrastructure/auth/auth.module';
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
import { DeleteUserProfileController } from './controllers/delete-user-profile.controller';
import { DeleteUserProfileService } from './services/delete-user-profile.service';
@Module({
  controllers: [
    CreateUserController,
    AuthenticateUserController,
    RefreshUserController,
    LogoutUserController,
    GetUserProfileController,
    DeleteUserProfileController,
  ],
  imports: [PrismaModule, AuthModule],
  providers: [
    CreateUserService,
    AuthenticateUserService,
    RefreshUserService,
    LogoutUserService,
    GetUserProfileService,
    DeleteUserProfileService,
  ],
})
export class UsersModule {}
