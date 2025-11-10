import { z } from 'zod/v4';

export const CreateProductDtoSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255),
  categoryId: z.number().int().positive('ID da categoria deve ser um número positivo'),
  stockQuantity: z.number().int().min(0, 'Quantidade em estoque deve ser maior ou igual a 0'),
  unitPrice: z.number().positive('Preço unitário deve ser maior que 0'),
  description: z.string().optional(),
});

export type CreateProductDto = z.infer<typeof CreateProductDtoSchema>;
