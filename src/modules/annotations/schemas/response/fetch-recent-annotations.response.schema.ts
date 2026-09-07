import { annotationResponseSchema } from '@modules/episodes/schemas/response/create-episode.response.schema';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const fetchRecentAnnotationsResponseSchema = z.object({
  annotations: z.array(annotationResponseSchema),
});

export class FetchRecentAnnotationsResponseDto extends createZodDto(
  fetchRecentAnnotationsResponseSchema,
) {}
