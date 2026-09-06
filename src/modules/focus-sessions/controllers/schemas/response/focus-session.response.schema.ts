import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const focusSessionItemStatusSchema = z.enum([
  'pending',
  'reviewed',
  'skipped',
]);

export const focusSessionStatusSchema = z.enum([
  'in_progress',
  'finished',
]);

export const focusSessionItemResponseSchema = z.object({
  episodeId: z.uuid(),
  position: z.number().int().min(0),
  status: focusSessionItemStatusSchema,
});

export const focusSessionResponseSchema = z.object({
  id: z.uuid(),
  stackId: z.uuid(),
  status: focusSessionStatusSchema,
  startedAt: z.iso.datetime(),
  currentIndex: z.number().int().min(0),
  items: z.array(focusSessionItemResponseSchema),
});

export class FocusSessionResponseDto extends createZodDto(
  focusSessionResponseSchema,
) {}
