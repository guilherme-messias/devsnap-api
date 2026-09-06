import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const focusSessionItemNotFoundErrorResponseSchema = z.object({
  statusCode: z.literal(404),
  message: z.literal('Focus session item not found'),
  error: z.literal('Not Found'),
});

export class FocusSessionItemNotFoundErrorResponseDto extends createZodDto(
  focusSessionItemNotFoundErrorResponseSchema,
) {}
