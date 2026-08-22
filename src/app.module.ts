import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EpisodesModule } from './modules/episodes/episodes.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { StacksModule } from './modules/stacks/stacks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    EpisodesModule,
    StacksModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
