import { PrismaModule } from '@infrastructure/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { CreateAnnotationsController } from './controllers/create-annotations.controller';
import { CreateAnnotationsService } from './services/create-annotations.service';
import { DeleteAnnotationsByIdController } from './controllers/delete-annotations-by-id.controller';
import { DeleteAnnotationsByIdService } from './services/delete-annotations-by-id.service';
import { FetchAnnotationsByIdController } from './controllers/fetch-annotations-by-id.controller';
import { FetchAnnotationsByIdService } from './services/fetch-annotations-by-id.service';

@Module({
  controllers: [
    CreateAnnotationsController,
    DeleteAnnotationsByIdController,
    FetchAnnotationsByIdController,
  ],
  imports: [PrismaModule],
  providers: [
    CreateAnnotationsService,
    DeleteAnnotationsByIdService,
    FetchAnnotationsByIdService,
  ],
})
export class AnnotationsModule {}
