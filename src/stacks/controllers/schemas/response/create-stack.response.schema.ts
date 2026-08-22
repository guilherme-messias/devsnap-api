import { createZodDto } from "nestjs-zod";
import z from "zod";

export const stackResponseSchema = z.object({
  name: z.string().trim().min(1).max(100),
});

export const createStackResponseSchema = stackResponseSchema;

export class CreateStackResponseDto extends createZodDto(
  createStackResponseSchema,
) {}
