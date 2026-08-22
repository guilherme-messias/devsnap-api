import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateStackDto } from '../controllers/schemas/request/update-stack.request.schema';

@Injectable()
export class UpdateStackService {
  constructor(private prisma: PrismaService) {}

  async updateStack(id: string, data: UpdateStackDto) {
    const { count } = await this.prisma.stack.updateMany({
      where: { id },
      data,
    });

    if (count === 0) {
      return null;
    }

    return this.prisma.stack.findUnique({
      where: { id },
    });
  }
}
