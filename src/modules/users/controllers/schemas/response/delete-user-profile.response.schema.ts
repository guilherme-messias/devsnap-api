import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const deleteUserProfileResponseSchema = z.object({
  name: z.string(),
  email: z.string(),
});

export class DeleteUserProfileResponseDto extends createZodDto(
  deleteUserProfileResponseSchema,
) {}
