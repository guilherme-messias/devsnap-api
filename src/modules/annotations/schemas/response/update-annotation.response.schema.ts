import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { createAnnotationResponseSchema } from './create-annotation.response.schema';

export const updateAnnotationResponseSchema = z.object({
  annotation: createAnnotationResponseSchema,
});

export class UpdateAnnotationResponseDto extends createZodDto(
  updateAnnotationResponseSchema,
) {}
