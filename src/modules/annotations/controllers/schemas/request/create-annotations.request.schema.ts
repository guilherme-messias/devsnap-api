import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const createAnnotationsSchema = z.object({
  text: z.string().trim().min(1).max(1000),
});

export class CreateAnnotationsDto extends createZodDto(
  createAnnotationsSchema,
) {}
