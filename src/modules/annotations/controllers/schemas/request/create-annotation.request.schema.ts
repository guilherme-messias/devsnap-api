import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const createAnnotationSchema = z.object({
  text: z.string().trim().min(1).max(1000),
});

export class CreateAnnotationDto extends createZodDto(createAnnotationSchema) {}
