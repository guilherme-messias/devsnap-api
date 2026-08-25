import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const annotationOrEpisodeNotFoundErrorResponseSchema = z.object({
  statusCode: z.literal(404),
  message: z.literal('Annotation or episode not found'),
  error: z.literal('Not Found'),
});

export class AnnotationOrEpisodeNotFoundErrorResponseDto extends createZodDto(
  annotationOrEpisodeNotFoundErrorResponseSchema,
) {}
