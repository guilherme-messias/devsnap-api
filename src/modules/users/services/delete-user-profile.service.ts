import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { CacheRepository } from '@infrastructure/cache/cache-repository';
import { CacheKeys } from '@infrastructure/cache/cache-keys';

@Injectable()
export class DeleteUserProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheRepository,
  ) {}

  async deleteUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    const deletedUser = await this.prisma.user.delete({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await this.cache.delete(CacheKeys.dashboard(userId));

    return deletedUser;
  }
}
