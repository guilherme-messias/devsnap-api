import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { updateAnnotationSchema } from '../request/update-annotation.request.schema';

export const updateAnnotationResponseSchema = z.object({
  annotation: updateAnnotationSchema,
});

export class UpdateAnnotationResponseDto extends createZodDto(
  updateAnnotationResponseSchema,
) {}
