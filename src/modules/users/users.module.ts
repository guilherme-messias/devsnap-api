import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/infrastructure/prisma/prisma.module';
import { CreateUserController } from './controllers/create-user.controller';
import { CreateUserService } from './services/create-user.service';

@Module({
  controllers: [CreateUserController],
  imports: [PrismaModule],
  providers: [CreateUserService],
})
export class UsersModule {}
