import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(8),
  avatarUrl: z.string().optional(),
  role: z.string().optional(),
});

export class CreateUserDto extends createZodDto(createUserSchema) {}
