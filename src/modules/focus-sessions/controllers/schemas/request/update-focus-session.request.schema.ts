import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const updateFocusSessionSchema = z.object({
  currentIndex: z.number().int().min(0),
});

export class UpdateFocusSessionDto extends createZodDto(
  updateFocusSessionSchema,
) {}
