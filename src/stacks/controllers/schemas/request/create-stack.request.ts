import z from "zod";

export const createStackSchema = z.object({
  name: z.string().trim().min(1).max(100),
});