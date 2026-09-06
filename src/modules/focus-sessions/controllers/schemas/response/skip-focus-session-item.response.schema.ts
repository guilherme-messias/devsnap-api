import { createZodDto } from 'nestjs-zod';
import { focusSessionResponseSchema } from './focus-session.response.schema';

export const skipFocusSessionItemResponseSchema = focusSessionResponseSchema;

export class SkipFocusSessionItemResponseDto extends createZodDto(
  skipFocusSessionItemResponseSchema,
) {}
