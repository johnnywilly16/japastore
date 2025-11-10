import { z } from 'zod';

export const CreateCostSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  value: z.number().positive('Value must be positive'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  type: z.enum(['stock_product', 'external_service']),
  productId: z.string().uuid().optional(),
});

export type CreateCostDto = z.infer<typeof CreateCostSchema>;

