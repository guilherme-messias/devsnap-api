import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const emailOrPasswordInvalidErrorResponseSchema = z.object({
  statusCode: z.literal(401),
  message: z.literal('Email or password invalid'),
  error: z.literal('Unauthorized'),
});

export class EmailOrPasswordInvalidErrorResponseDto extends createZodDto(
  emailOrPasswordInvalidErrorResponseSchema,
) {}
