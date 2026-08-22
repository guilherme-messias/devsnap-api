import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { stackResponseSchema } from './create-stack.response.schema';

export const fetchStackResponseSchema = z.object({
  stack: stackResponseSchema,
});

export class FetchStackResponseDto extends createZodDto(
  fetchStackResponseSchema,
) {}
