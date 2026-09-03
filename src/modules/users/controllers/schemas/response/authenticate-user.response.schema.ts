import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const authenticateUserResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export class AuthenticateUserResponseDto extends createZodDto(
  authenticateUserResponseSchema,
) {}
