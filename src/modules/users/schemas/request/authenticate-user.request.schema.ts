import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const authenticateUserSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export class AuthenticateUserDto extends createZodDto(authenticateUserSchema) {}
