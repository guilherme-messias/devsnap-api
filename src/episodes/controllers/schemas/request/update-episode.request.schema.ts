import z from 'zod';

export const updateEpisodeSchema = z
  .object({
    title: z.string(),
    stack: z.string(),
    error: z.string(),
    solution: z.string(),
  })
  .partial();

export type UpdateEpisodeRequest = z.infer<typeof updateEpisodeSchema>;
