import { PrismaModule } from '@infrastructure/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { CreateAnnotationsController } from './controllers/create-annotations.service';
import { CreateAnnotationsService } from './services/create-annotations.service';

@Module({
  controllers: [CreateAnnotationsController],
  imports: [PrismaModule],
  providers: [CreateAnnotationsService],
})
export class AnnotationsModule {}
