import { z } from 'zod/v4';

export const UpdateProductDtoSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  categoryId: z.number().int().positive().optional(),
  stockQuantity: z.number().int().min(0).optional(),
  unitPrice: z.number().positive().optional(),
  description: z.string().optional(),
});

export type UpdateProductDto = z.infer<typeof UpdateProductDtoSchema>;
