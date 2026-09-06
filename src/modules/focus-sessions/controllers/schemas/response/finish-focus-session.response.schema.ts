import { createZodDto } from 'nestjs-zod';
import { focusSessionResponseSchema } from './focus-session.response.schema';

export const finishFocusSessionResponseSchema = focusSessionResponseSchema;

export class FinishFocusSessionResponseDto extends createZodDto(
  finishFocusSessionResponseSchema,
) {}
