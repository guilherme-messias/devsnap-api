import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const stackResponseSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1).max(150),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const createStackResponseSchema = stackResponseSchema;

export class CreateStackResponseDto extends createZodDto(
  createStackResponseSchema,
) {}
