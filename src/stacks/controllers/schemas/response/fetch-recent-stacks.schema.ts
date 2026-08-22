import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { stackResponseSchema } from './create-stack.response.schema';

const fetchRecentStacksResponseSchema = z.object({
  stacks: z.array(stackResponseSchema),
});

export class FetchRecentStacksResponseDto extends createZodDto(
  fetchRecentStacksResponseSchema,
) {}
