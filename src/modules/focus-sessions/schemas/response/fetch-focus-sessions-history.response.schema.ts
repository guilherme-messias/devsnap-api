import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { focusSessionResponseSchema } from './focus-session.response.schema';

export const fetchFocusSessionsHistoryResponseSchema = z.object({
  focusSessions: z.array(focusSessionResponseSchema),
});

export class FetchFocusSessionsHistoryResponseDto extends createZodDto(
  fetchFocusSessionsHistoryResponseSchema,
) {}
