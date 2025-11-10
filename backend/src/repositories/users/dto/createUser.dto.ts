import { z } from 'zod/v4';

export const CreateUserDtoSchema = z.object({
  name: z.string().nonempty({ error: 'Name is required' }),
  email: z
    .email({ error: 'Invalid email address' })
    .nonempty({ error: 'Email is required' }),
  passwordHash: z
    .string()
    .min(6, { error: 'Password must be at least 6 characters long' })
    .nonempty({ error: 'Password is required' }),
});

export type CreateUserDto = z.infer<typeof CreateUserDtoSchema>;
