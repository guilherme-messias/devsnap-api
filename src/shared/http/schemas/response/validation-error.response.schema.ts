import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const validationErrorResponseSchema = z.object({
  message: z.literal('Validation failed'),
  statusCode: z.literal(400),
  errors: z.object({
    formErrors: z.array(z.string()),
    fieldErrors: z.record(z.string(), z.array(z.string())),
  }),
});

export class ValidationErrorResponseDto extends createZodDto(
  validationErrorResponseSchema,
) {}
