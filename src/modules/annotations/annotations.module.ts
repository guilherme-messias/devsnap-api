import { PrismaModule } from "@infrastructure/prisma/prisma.module";
import { Module } from "@nestjs/common";

@Module({
  controllers: [],
  imports: [PrismaModule],
  providers: [],
})
export class AnnotationsModule {}