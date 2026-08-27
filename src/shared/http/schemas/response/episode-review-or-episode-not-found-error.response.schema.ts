import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const episodeReviewOrEpisodeNotFoundErrorResponseSchema = z.object({
  statusCode: z.literal(404),
  message: z.literal('Episode review or episode not found'),
  error: z.literal('Not Found'),
});

export class EpisodeReviewOrEpisodeNotFoundErrorResponseDto extends createZodDto(
  episodeReviewOrEpisodeNotFoundErrorResponseSchema,
) {}
