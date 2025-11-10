import { z } from 'zod';

export const CreateServiceOrderSchema = z.object({
  customerId: z.string().uuid('Customer ID must be a valid UUID'),
  deviceModel: z.string().min(1, 'Device model is required'),
  problem: z.string().min(1, 'Problem description is required'),
  estimatedCost: z.number().positive().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  completionDate: z.string().datetime().optional(),
});

export type CreateServiceOrderDto = z.infer<typeof CreateServiceOrderSchema>;

