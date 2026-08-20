import z from 'zod';

export const createEpisodeSchema = z.object({
  title: z.string(),
  stack: z.string(),
  error: z.string(),
  solution: z.string(),
});

export const updateEpisodeSchema = createEpisodeSchema.partial();

export type CreateEpisodeRequest = z.infer<typeof createEpisodeSchema>;
export type UpdateEpisodeRequest = z.infer<typeof updateEpisodeSchema>;
