import { annotationResponseSchema } from '@modules/episodes/schemas/response/create-episode.response.schema';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const fetchAnnotationResponseSchema = z.object({
  annotation: annotationResponseSchema,
});

export class FetchAnnotationResponseDto extends createZodDto(
  fetchAnnotationResponseSchema,
) {}
