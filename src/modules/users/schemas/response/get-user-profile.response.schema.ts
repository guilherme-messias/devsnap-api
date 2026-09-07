import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const userProfileResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  avatarUrl: z.string().nullable(),
  role: z.string().nullable(),
});

export class UserProfileResponseDto extends createZodDto(
  userProfileResponseSchema,
) {}
