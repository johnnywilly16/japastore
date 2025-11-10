import { z } from 'zod';

export const CreateCustomerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  cpf: z.string().length(11, 'CPF deve ter 11 dígitos').optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  birthDate: z.string().optional(),
  customerType: z.enum(['vip', 'regular', 'occasional', 'new']).default('new'),
  notes: z.string().optional(),
  preferredPaymentMethod: z.string().optional(),
});

export type CreateCustomerDto = z.infer<typeof CreateCustomerSchema>;
