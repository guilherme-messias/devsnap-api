import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const refreshUserResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export class RefreshUserResponseDto extends createZodDto(
  refreshUserResponseSchema,
) {}
