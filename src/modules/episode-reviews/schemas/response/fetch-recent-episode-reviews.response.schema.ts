import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { episodeReviewResponseSchema } from './create-episode-review.response.schema';

const fetchRecentEpisodeReviewsResponseSchema = z.object({
  episodeReviews: z.array(episodeReviewResponseSchema),
});

export class FetchRecentEpisodeReviewsResponseDto extends createZodDto(
  fetchRecentEpisodeReviewsResponseSchema,
) {}
