import { createZodDto } from 'nestjs-zod';
import { focusSessionResponseSchema } from './focus-session.response.schema';

export const reviewFocusSessionItemResponseSchema = focusSessionResponseSchema;

export class ReviewFocusSessionItemResponseDto extends createZodDto(
  reviewFocusSessionItemResponseSchema,
) {}
