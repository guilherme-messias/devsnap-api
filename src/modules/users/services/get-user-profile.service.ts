import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { CacheRepository } from '@infrastructure/cache/cache-repository';
import { CacheKeys } from '@infrastructure/cache/cache-keys';
import { userProfileResponseSchema } from '../schemas/response/get-user-profile.response.schema';
import type { z } from 'zod';

const CACHE_TTL_IN_SECONDS = 60 * 5;

type UserProfile = z.infer<typeof userProfileResponseSchema>;

@Injectable()
export class GetUserProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheRepository,
  ) {}

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const cacheKey = CacheKeys.userProfile(userId);
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return userProfileResponseSchema.parse(JSON.parse(cached) as unknown);
    }

    const user = await this.buildUserProfile(userId);
    if (user) {
      await this.cache.set(
        cacheKey,
        JSON.stringify(user),
        CACHE_TTL_IN_SECONDS,
      );
    }
    return user;
  }

  private async buildUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
      },
    });
    return user;
  }
}
