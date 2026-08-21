import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const createEpisodeSchema = z.object({
  title: z.string(),
  stack: z.string(),
  error: z.string(),
  solution: z.string(),
});

export const updateEpisodeSchema = createEpisodeSchema.partial();

export class CreateEpisodeDto extends createZodDto(createEpisodeSchema) {}

export type UpdateEpisodeRequest = z.infer<typeof updateEpisodeSchema>;
