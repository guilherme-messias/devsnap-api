import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { episodeResponseSchema } from './create-episode.response.schema';

export const updateEpisodeResponseSchema = z.object({
  episode: episodeResponseSchema,
});

export class UpdateEpisodeResponseDto extends createZodDto(
  updateEpisodeResponseSchema,
) {}
