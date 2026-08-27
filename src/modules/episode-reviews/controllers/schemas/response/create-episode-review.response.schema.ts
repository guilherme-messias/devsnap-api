import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const episodeReviewResponseSchema = z.object({
  id: z.uuid(),
  episodeId: z.uuid(),
  reviewAt: z.iso.datetime(),
  result: z.string().trim().min(1).max(500),
  focusSessionId: z.uuid().optional(),
});

export const createEpisodeReviewResponseSchema = episodeReviewResponseSchema;

export class CreateEpisodeReviewResponseDto extends createZodDto(
  createEpisodeReviewResponseSchema,
) {}
