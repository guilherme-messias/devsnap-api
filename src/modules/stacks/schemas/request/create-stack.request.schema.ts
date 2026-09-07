import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const createStackSchema = z.object({
  name: z.string().trim().min(1).max(100),
  userId: z.uuid(),
});

export class CreateStackDto extends createZodDto(createStackSchema) {}
