import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { CacheRepository } from '@infrastructure/cache/cache-repository';
import { CacheKeys } from '@infrastructure/cache/cache-keys';

const CACHE_TTL_IN_SECONDS = 60 * 5;

@Injectable()
export class GetUserProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheRepository,
  ) {}

  async getUserProfile(userId: string) {
    const cacheKey = CacheKeys.userProfile(userId);
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const user = await this.buildUserProfile(userId);
    await this.cache.set(cacheKey, JSON.stringify(user), CACHE_TTL_IN_SECONDS);
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
