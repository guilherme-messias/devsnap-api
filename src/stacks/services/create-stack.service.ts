import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class CreateStackService {
  constructor(private prisma: PrismaService) { }
  
  async createStack(data: { name: string }) {
}