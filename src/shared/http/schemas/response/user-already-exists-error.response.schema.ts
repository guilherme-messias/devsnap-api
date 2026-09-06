import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const userAlreadyExistsErrorResponseSchema = z.object({
  statusCode: z.literal(400),
  message: z.literal('User already exists'),
  error: z.literal('Bad Request'),
});

export class UserAlreadyExistsErrorResponseDto extends createZodDto(
  userAlreadyExistsErrorResponseSchema,
) {}
