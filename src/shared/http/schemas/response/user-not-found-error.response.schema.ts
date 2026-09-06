import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const userNotFoundErrorResponseSchema = z.object({
  statusCode: z.literal(404),
  message: z.literal('User not found'),
  error: z.literal('Not Found'),
});

export class UserNotFoundErrorResponseDto extends createZodDto(
  userNotFoundErrorResponseSchema,
) {}
