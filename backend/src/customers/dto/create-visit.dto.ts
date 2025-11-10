import { z } from 'zod';

export const CreateVisitSchema = z.object({
  visitDate: z.string().datetime().optional(),
  visitType: z.enum(['purchase', 'service', 'consultation', 'complaint']),
  notes: z.string().optional(),
});

export type CreateVisitDto = z.infer<typeof CreateVisitSchema>;

