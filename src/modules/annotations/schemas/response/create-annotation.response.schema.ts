import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const createAnnotationResponseSchema = z.object({
  id: z.uuid(),
  text: z.string().trim().min(1).max(1000),
  episodeId: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime().nullable(),
});

export class CreateAnnotationResponseDto extends createZodDto(
  createAnnotationResponseSchema,
) {}
