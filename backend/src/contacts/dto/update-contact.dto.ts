import { z } from 'zod';

export const UpdateContactDto = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  contactType: z.enum(['lead', 'prospect', 'client', 'partner', 'supplier']).optional(),
  source: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z.enum(['active', 'inactive', 'qualified', 'unqualified', 'converted', 'lost']).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  customFields: z.record(z.any()).optional(),
  customerId: z.number().optional(),
  isCustomer: z.boolean().optional(),
  nextFollowUp: z.string().datetime().optional(),
  aiScore: z.number().min(0).max(100).optional(),
  aiInsights: z.record(z.any()).optional(),
});

export type UpdateContactDtoType = z.infer<typeof UpdateContactDto>;
