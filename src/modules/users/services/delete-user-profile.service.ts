import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/prisma/prisma.service';

@Injectable()
export class DeleteUserProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async deleteUserProfile(userId: string) {
    return this.prisma.user.delete({
      where: { id: userId },
    });
  }
}
