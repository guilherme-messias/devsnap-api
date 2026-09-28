import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule as JwtNestModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../jwt/jwt.strategy';
import { RefreshTokenStrategy } from '../jwt/refresh-token.strategy';
import { PrismaModule } from '../prisma/prisma.module';
@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtNestModule.registerAsync({
      inject: [ConfigService],
      global: true,
      useFactory: (configService: ConfigService) => ({
        publicKey: Buffer.from(
          configService.getOrThrow<string>('JWT_PUBLIC_KEY'),
          'base64',
        ).toString('utf-8'),
        privateKey: Buffer.from(
          configService.getOrThrow<string>('JWT_PRIVATE_KEY'),
          'base64',
        ).toString('utf-8'),
        signOptions: { algorithm: 'RS256', expiresIn: '15m' },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, RefreshTokenStrategy],
  exports: [AuthService, PassportModule],
})
export class AuthModule {}
