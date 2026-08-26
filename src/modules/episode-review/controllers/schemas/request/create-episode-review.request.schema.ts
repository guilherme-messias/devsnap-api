import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const createEpisodeReviewSchema = z.object({
  episodeId: z.uuid(),
  result: z.string().trim().min(1).max(500),
  focusSessionId: z.uuid().optional(),
});

export class CreateEpisodeReviewDto extends createZodDto(
  createEpisodeReviewSchema,
) {}
