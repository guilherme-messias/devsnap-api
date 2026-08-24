import { PrismaModule } from '@infrastructure/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { CreateAnnotationsController } from './controllers/create-annotations.controller';
import { CreateAnnotationsService } from './services/create-annotations.service';
import { DeleteAnnotationsByIdController } from './controllers/delete-annotations-by-id.controller';
import { DeleteAnnotationsByIdService } from './services/delete-annotations-by-id.service';
import { FetchAnnotationByIdController } from './controllers/fetch-annotation-by-id.controller';
import { FetchAnnotationByIdService } from './services/fetch-annotation-by-id.service';

@Module({
  controllers: [
    CreateAnnotationsController,
    DeleteAnnotationsByIdController,
    FetchAnnotationByIdController,
  ],
  imports: [PrismaModule],
  providers: [
    CreateAnnotationsService,
    DeleteAnnotationsByIdService,
    FetchAnnotationByIdService,
  ],
})
export class AnnotationsModule {}
