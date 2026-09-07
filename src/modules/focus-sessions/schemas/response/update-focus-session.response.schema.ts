import { createZodDto } from 'nestjs-zod';
import { focusSessionResponseSchema } from './focus-session.response.schema';

export const updateFocusSessionResponseSchema = focusSessionResponseSchema;

export class UpdateFocusSessionResponseDto extends createZodDto(
  updateFocusSessionResponseSchema,
) {}
