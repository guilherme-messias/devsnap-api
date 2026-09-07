import { createZodDto } from 'nestjs-zod';
import { focusSessionResponseSchema } from './focus-session.response.schema';

export const createFocusSessionResponseSchema = focusSessionResponseSchema;

export class CreateFocusSessionResponseDto extends createZodDto(
  createFocusSessionResponseSchema,
) {}
