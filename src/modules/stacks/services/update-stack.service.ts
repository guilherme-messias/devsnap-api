import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { UpdateStackDto } from '../schemas/request/update-stack.request.schema';

@Injectable()
export class UpdateStackService {
  constructor(private prisma: PrismaService) {}

  async updateStack(id: string, data: UpdateStackDto, userId: string) {
    const { count } = await this.prisma.stack.updateMany({
      where: { id, userId },
      data,
    });

    if (count === 0) {
      return null;
    }

    return this.prisma.stack.findFirst({
      where: { id, userId },
    });
  }
}
