import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/infrastructure/prisma/prisma.module';
import { CreateUserController } from './controllers/create-user.controller';
import { CreateUserService } from './services/create-user.service';
import { AuthenticateUserService } from './services/authenticate-user.service';
import { AuthenticateUserController } from './controllers/authenticate-user.controller';
@Module({
  controllers: [CreateUserController, AuthenticateUserController],
  imports: [PrismaModule],
  providers: [CreateUserService, AuthenticateUserService],
})
export class UsersModule {}
