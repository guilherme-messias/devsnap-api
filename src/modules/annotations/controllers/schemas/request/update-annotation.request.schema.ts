import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const updateAnnotationSchema = z.object({
  text: z.string().trim().min(1).max(1000),
});

export class UpdateAnnotationDto extends createZodDto(updateAnnotationSchema) {}
