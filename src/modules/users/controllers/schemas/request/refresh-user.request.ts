import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const refreshUserSchema = z.object({
  userId: z.string(),
  refreshToken: z.string(),
});

export class RefreshUserDto extends createZodDto(refreshUserSchema) {}
