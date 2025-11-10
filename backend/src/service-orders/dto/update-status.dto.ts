import { z } from 'zod';

export const UpdateStatusSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  completionDate: z.string().datetime().optional(),
});

export type UpdateStatusDto = z.infer<typeof UpdateStatusSchema>;

