import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

import { episodeResponseSchema } from './create-episode.response.schema';

const fetchRecentEpisodesResponseSchema = z.object({
  episodes: z.array(episodeResponseSchema),
});

export class FetchRecentEpisodesResponseDto extends createZodDto(
  fetchRecentEpisodesResponseSchema,
) {}
