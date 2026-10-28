import z from 'zod';

export const pageQueryParamsSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().int().min(1));

export const perPageQueryParamsSchema = z
  .string()
  .optional()
  .default('10')
  .transform(Number)
  .pipe(z.number().int().min(1).max(100));

export type PageQueryParams = z.infer<typeof pageQueryParamsSchema>;
export type PerPageQueryParams = z.infer<typeof perPageQueryParamsSchema>;

export type PaginationParams = {
  page: number;
  perPage: number;
};
