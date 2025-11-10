import { z } from 'zod';

export const CreateInteractionDto = z.object({
  contactId: z.number(),
  type: z.enum(['call', 'email', 'meeting', 'note', 'task', 'demo', 'proposal', 'follow_up']),
  description: z.string().min(1, 'Descrição é obrigatória'),
  outcome: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  duration: z.number().min(0).optional(),
  notes: z.string().optional(),
  attachments: z.array(z.string()).default([]),
  followUpDate: z.string().datetime().optional(),
});

export type CreateInteractionDtoType = z.infer<typeof CreateInteractionDto>;
