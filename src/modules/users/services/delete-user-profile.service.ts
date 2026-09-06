import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';

@Injectable()
export class DeleteUserProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async deleteUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return;
  }
}
