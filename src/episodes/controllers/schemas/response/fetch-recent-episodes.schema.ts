import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

import { fetchEpisodeResponseSchema } from './fetch-episode.response.schema';

const fetchRecentEpisodesResponseSchema = z.object({
  episodes: z.array(fetchEpisodeResponseSchema),
});

export class FetchRecentEpisodesResponseDto extends createZodDto(
  fetchRecentEpisodesResponseSchema,
) {}
