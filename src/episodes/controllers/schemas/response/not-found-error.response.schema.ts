import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const notFoundErrorResponseSchema = z.object({
  statusCode: z.literal(404),
  message: z.string(),
  error: z.literal('Not Found'),
});

export class NotFoundErrorResponseDto extends createZodDto(
  notFoundErrorResponseSchema,
) {}
