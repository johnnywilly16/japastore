import { z } from 'zod/v4';

export const EndSessionDtoSchema = z.object({
  notes: z.string().optional(),
});

export type EndSessionDto = z.infer<typeof EndSessionDtoSchema>;
