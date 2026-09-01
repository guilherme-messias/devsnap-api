import { Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule as JwtNestModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PassportModule,
    JwtNestModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        publicKey: configService.get('JWT_PUBLIC_KEY'),
        privateKey: configService.get('JWT_PRIVATE_KEY'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') },
        //TODO: adicionar return
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [JwtService],
  exports: [JwtService],
})
export class JwtModule {}
