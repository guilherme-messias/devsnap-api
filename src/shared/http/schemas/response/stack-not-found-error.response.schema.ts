import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const stackNotFoundErrorResponseSchema = z.object({
  statusCode: z.literal(404),
  message: z.literal('Stack not found'),
  error: z.literal('Not Found'),
});

export class StackNotFoundErrorResponseDto extends createZodDto(
  stackNotFoundErrorResponseSchema,
) {}
