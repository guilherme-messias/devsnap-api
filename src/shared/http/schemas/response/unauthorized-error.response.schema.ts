import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const unauthorizedErrorResponseSchema = z.object({
  statusCode: z.literal(401),
  message: z.string(),
  error: z.literal('Unauthorized'),
});

export class UnauthorizedErrorResponseDto extends createZodDto(
  unauthorizedErrorResponseSchema,
) {}
