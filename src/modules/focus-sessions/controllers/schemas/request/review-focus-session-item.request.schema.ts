import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const reviewFocusSessionItemSchema = z.object({
  result: z.string().trim().min(1).max(500),
});

export class ReviewFocusSessionItemDto extends createZodDto(
  reviewFocusSessionItemSchema,
) {}
