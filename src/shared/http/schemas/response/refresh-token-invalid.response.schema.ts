import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const refreshTokenInvalidErrorResponseSchema = z.object({
  statusCode: z.literal(401),
  message: z.literal('Refresh token invalid'),
  error: z.literal('Unauthorized'),
});

export class RefreshTokenInvalidErrorResponseDto extends createZodDto(
  refreshTokenInvalidErrorResponseSchema,
) {}
