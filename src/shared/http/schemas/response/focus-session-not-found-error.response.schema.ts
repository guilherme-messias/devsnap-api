import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const focusSessionNotFoundErrorResponseSchema = z.object({
  statusCode: z.literal(404),
  message: z.literal('Focus session not found'),
  error: z.literal('Not Found'),
});

export class FocusSessionNotFoundErrorResponseDto extends createZodDto(
  focusSessionNotFoundErrorResponseSchema,
) {}
