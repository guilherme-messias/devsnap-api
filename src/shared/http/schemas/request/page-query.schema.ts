import z from 'zod';

export const pageQueryParamsSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().int().min(1));

export type PageQueryParams = z.infer<typeof pageQueryParamsSchema>;

export type PaginationParams = {
  page: number;
  perPage: number;
};
