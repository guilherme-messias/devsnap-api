import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const createAnnotationsResponseSchema = z.object({
  id: z.uuid(),
  text: z.string().trim().min(1).max(1000),
  episodeId: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export class CreateAnnotationsResponseDto extends createZodDto(
  createAnnotationsResponseSchema,
) {}
