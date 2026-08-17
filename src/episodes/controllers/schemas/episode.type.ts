import z from "zod";

export const createEpisodeSchema = z.object({
  title: z.string(),
  stack: z.string(),
  error: z.string(),
  solution: z.string(),
});

export type CreateEpisodeRequest = z.infer<typeof createEpisodeSchema>;