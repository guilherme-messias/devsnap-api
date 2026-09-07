import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { episodeReviewResponseSchema } from './create-episode-review.response.schema';

export const fetchEpisodeReviewResponseSchema = z.object({
  episodeReview: episodeReviewResponseSchema,
});

export class FetchEpisodeReviewResponseDto extends createZodDto(
  fetchEpisodeReviewResponseSchema,
) {}
