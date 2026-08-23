import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const annotationResponseSchema = z.object({
  id: z.uuid(),
  text: z.string(),
  episodeId: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const episodeResponseSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  stackId: z.uuid(),
  stack: z.object({
    id: z.uuid(),
    name: z.string(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  }),
  error: z.string(),
  solution: z.string(),
  annotations: z.array(annotationResponseSchema),
  reviewed: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const createEpisodeResponseSchema = episodeResponseSchema;

export class CreateEpisodeResponseDto extends createZodDto(
  createEpisodeResponseSchema,
) {}
