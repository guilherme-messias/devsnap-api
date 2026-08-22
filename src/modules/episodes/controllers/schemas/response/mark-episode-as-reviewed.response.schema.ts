import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { episodeResponseSchema } from './create-episode.response.schema';

export const markEpisodeAsReviewedResponseSchema = z.object({
  episode: episodeResponseSchema,
});

export class MarkEpisodeAsReviewedResponseDto extends createZodDto(
  markEpisodeAsReviewedResponseSchema,
) {}
