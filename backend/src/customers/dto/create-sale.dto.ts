import { z } from 'zod';

export const CreateSaleSchema = z.object({
  customerId: z.string().uuid('ID do cliente deve ser um UUID válido'),
  productId: z.string().uuid('ID do produto deve ser um UUID válido'),
  quantity: z.number().int().positive('Quantidade deve ser um número positivo'),
  unitPrice: z.number().positive('Preço unitário deve ser positivo'),
  discount: z.number().min(0, 'Desconto não pode ser negativo').default(0),
  paymentMethod: z.string().min(1, 'Método de pagamento é obrigatório'),
  saleDate: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateSaleDto = z.infer<typeof CreateSaleSchema>;
