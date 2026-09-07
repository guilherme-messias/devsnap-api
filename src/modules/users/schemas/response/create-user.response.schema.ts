import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const userResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  createdAt: z.iso.datetime(),
});

export const createUserResponseSchema = userResponseSchema;

export class CreateUserResponseDto extends createZodDto(
  createUserResponseSchema,
) {}
