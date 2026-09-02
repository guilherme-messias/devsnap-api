import { Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule as JwtNestModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PassportModule,
    JwtNestModule.registerAsync({
      inject: [ConfigService],
      global: true,
      useFactory: async (configService: ConfigService) => ({
        publicKey: Buffer.from(
          configService.get('JWT_PUBLIC_KEY'),
          'base64',
        ).toString('utf-8'),
        privateKey: Buffer.from(
          configService.get('JWT_PRIVATE_KEY'),
          'base64',
        ).toString('utf-8'),
        signOptions: { algorithm: 'RS256' },
      }),
    }),
  ],
  providers: [JwtService],
  exports: [JwtService],
})
export class JwtModule {}
