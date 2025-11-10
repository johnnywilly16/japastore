import { z } from 'zod/v4';

export const AuthRequestDtoSchema = z.object({
  email: z.email().nonempty(),
  password: z.string().min(8).max(50),
});

export type AuthRequestDto = z.infer<typeof AuthRequestDtoSchema>;
