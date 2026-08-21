import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const createEpisodeSchema = z.object({
  title: z.string(),
  stack: z.string(),
  error: z.string(),
  solution: z.string(),
});

export class CreateEpisodeDto extends createZodDto(createEpisodeSchema) {}
