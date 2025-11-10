import { z } from 'zod/v4';

export const StartSessionDtoSchema = z.object({
  notes: z.string().optional(),
});

export type StartSessionDto = z.infer<typeof StartSessionDtoSchema>;
