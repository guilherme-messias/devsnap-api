import { strongPasswordSchema } from '@src/shared/http/schemas/request/password.schema';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: strongPasswordSchema,
  avatarUrl: z.string().optional(),
  role: z.string().optional(),
});

export class CreateUserDto extends createZodDto(createUserSchema) {}
