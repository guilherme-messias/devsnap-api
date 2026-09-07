import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const createFocusSessionSchema = z.object({
  stackId: z.uuid(),
});

export class CreateFocusSessionDto extends createZodDto(
  createFocusSessionSchema,
) {}
