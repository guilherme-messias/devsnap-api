import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const tokenExpiredErrorResponseSchema = z.object({
  statusCode: z.literal(401),
  message: z.literal('Unauthorized'),
});

export class TokenExpiredErrorResponseDto extends createZodDto(
  tokenExpiredErrorResponseSchema,
) {}
