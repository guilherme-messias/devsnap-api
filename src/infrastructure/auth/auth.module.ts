import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule as JwtNestModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../jwt/jwt.strategy';
import { RefreshTokenStrategy } from '../jwt/refresh-token.strategy';
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
        signOptions: { algorithm: 'RS256', expiresIn: '15m' },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, RefreshTokenStrategy],
  exports: [AuthService],
})
export class AuthModule {}
