import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const episodeNotFoundErrorResponseSchema = z.object({
  statusCode: z.literal(404),
  message: z.literal('Episode not found'),
  error: z.literal('Not Found'),
});

export class EpisodeNotFoundErrorResponseDto extends createZodDto(
  episodeNotFoundErrorResponseSchema,
) {}
