import { createZodDto } from 'nestjs-zod';
import z from 'zod';

/** Shape returned by the JWT guard when the token is missing, invalid, or expired. */
export const jwtUnauthorizedErrorResponseSchema = z.object({
  statusCode: z.literal(401),
  message: z.literal('Unauthorized'),
});

export class JwtUnauthorizedErrorResponseDto extends createZodDto(
  jwtUnauthorizedErrorResponseSchema,
) {}
