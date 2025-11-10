import { z } from 'zod';

export const CreateContactDto = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  contactType: z.enum(['lead', 'prospect', 'client', 'partner', 'supplier']).default('lead'),
  source: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['active', 'inactive', 'qualified', 'unqualified', 'converted', 'lost']).default('active'),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  customFields: z.record(z.any()).optional(),
  customerId: z.number().optional(),
  isCustomer: z.boolean().default(false),
  nextFollowUp: z.string().datetime().optional(),
});

export type CreateContactDtoType = z.infer<typeof CreateContactDto>;
