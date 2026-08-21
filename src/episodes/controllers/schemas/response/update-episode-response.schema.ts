import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const updateEpisodeResponseSchema = z.object({
  episode: z.object({
    id: z.uuid(),
    title: z.string(),
    stack: z.string(),
    error: z.string(),
    solution: z.string(),
    reviewed: z.boolean(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  }),
});

export class UpdateEpisodeResponseDto extends createZodDto(
  updateEpisodeResponseSchema,
) {}
