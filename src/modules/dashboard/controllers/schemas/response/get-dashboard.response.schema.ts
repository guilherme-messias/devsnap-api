import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const dashboardTotalsSchema = z.object({
  stacks: z.number().int().min(0),
  episodes: z.number().int().min(0),
  pending: z.number().int().min(0),
  reviewed: z.number().int().min(0),
  overdue: z.number().int().min(0),
});

const dashboardStackSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  episodeCount: z.number().int().min(0),
  pendingCount: z.number().int().min(0),
  reviewedCount: z.number().int().min(0),
  overdueCount: z.number().int().min(0),
  progressPercentage: z.number().min(0).max(100),
});

export const getDashboardResponseSchema = z.object({
  totals: dashboardTotalsSchema,
  stacks: z.array(dashboardStackSchema),
});

export class GetDashboardResponseDto extends createZodDto(
  getDashboardResponseSchema,
) {}
