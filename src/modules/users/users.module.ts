import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/infrastructure/prisma/prisma.module';
import { AuthModule } from '@src/infrastructure/auth/auth.module';
import { CreateUserController } from './controllers/create-user.controller';
import { CreateUserService } from './services/create-user.service';
import { AuthenticateUserService } from './services/authenticate-user.service';
import { AuthenticateUserController } from './controllers/authenticate-user.controller';
import { RefreshUserController } from './controllers/refresh-user.controller';
import { RefreshUserService } from './services/refresh-user.service';
@Module({
  controllers: [
    CreateUserController,
    AuthenticateUserController,
    RefreshUserController,
  ],
  imports: [PrismaModule, AuthModule],
  providers: [
    CreateUserService,
    AuthenticateUserService,
    RefreshUserService,
  ],
})
export class UsersModule {}
