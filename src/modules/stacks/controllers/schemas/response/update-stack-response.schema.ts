import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { stackResponseSchema } from './create-stack.response.schema';

export const updateStackResponseSchema = z.object({
  stack: stackResponseSchema,
});

export class UpdateStackResponseDto extends createZodDto(
  updateStackResponseSchema,
) {}
