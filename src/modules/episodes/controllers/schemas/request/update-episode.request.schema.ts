import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const updateEpisodeSchema = z
  .object({
    title: z.string().trim().min(1).max(150),
    stackId: z.uuid(),
    error: z.string().trim().min(1).max(5000),
    solution: z.string().trim().min(1).max(5000),
  })
  .partial();

export class UpdateEpisodeDto extends createZodDto(updateEpisodeSchema) {}
