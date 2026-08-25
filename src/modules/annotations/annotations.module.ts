import { PrismaModule } from '@infrastructure/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { CreateAnnotationController } from './controllers/create-annotation.controller';
import { CreateAnnotationService } from './services/create-annotation.service';
import { DeleteAnnotationByIdController } from './controllers/delete-annotation-by-id.controller';
import { DeleteAnnotationByIdService } from './services/delete-annotation-by-id.service';
import { FetchAnnotationByIdController } from './controllers/fetch-annotation-by-id.controller';
import { FetchAnnotationByIdService } from './services/fetch-annotation-by-id.service';
import { FetchRecentAnnotationsController } from './controllers/fetch-recent-annotations.controller';
import { FetchRecentAnnotationsService } from './services/fetch-recent-annotations.service';
import { UpdateAnnotationController } from './controllers/update-annotation.controller';
import { UpdateAnnotationService } from './services/update-annotation.service';

@Module({
  controllers: [
    CreateAnnotationController,
    DeleteAnnotationByIdController,
    FetchAnnotationByIdController,
    FetchRecentAnnotationsController,
    UpdateAnnotationController,
  ],
  imports: [PrismaModule],
  providers: [
    CreateAnnotationService,
    DeleteAnnotationByIdService,
    FetchAnnotationByIdService,
    FetchRecentAnnotationsService,
    UpdateAnnotationService,
  ],
})
export class AnnotationsModule {}
