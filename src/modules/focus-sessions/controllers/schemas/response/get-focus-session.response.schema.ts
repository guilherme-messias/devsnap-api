import { createZodDto } from 'nestjs-zod';
import { focusSessionResponseSchema } from './focus-session.response.schema';

export const getFocusSessionResponseSchema = focusSessionResponseSchema;

export class GetFocusSessionResponseDto extends createZodDto(
  getFocusSessionResponseSchema,
) {}
