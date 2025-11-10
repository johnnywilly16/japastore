import { z } from 'zod';
import { CreateCustomerSchema } from './create-customer.dto';

export const UpdateCustomerSchema = CreateCustomerSchema.partial().extend({
  totalSpent: z.number().optional(),
  totalVisits: z.number().optional(),
  lastVisit: z.string().optional(),
  averageDaysBetweenVisits: z.number().optional(),
});

export type UpdateCustomerDto = z.infer<typeof UpdateCustomerSchema>;
