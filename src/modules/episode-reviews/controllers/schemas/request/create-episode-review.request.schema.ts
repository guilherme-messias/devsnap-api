import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const createEpisodeReviewSchema = z.object({
  result: z.string().trim().min(1).max(500),
  focusSessionId: z.uuid().nullable().optional(),
});

export class CreateEpisodeReviewDto extends createZodDto(
  createEpisodeReviewSchema,
) {}
