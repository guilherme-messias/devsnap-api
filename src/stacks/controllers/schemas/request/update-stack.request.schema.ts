import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const updateStackSchema = z
  .object({
    title: z.string().trim().min(1).max(150),
  })
  .partial();

export class UpdateStackDto extends createZodDto(updateStackSchema) {}
