import z from 'zod';

export const uuidParamSchema = z.uuid();

export type UuidParam = z.infer<typeof uuidParamSchema>;
