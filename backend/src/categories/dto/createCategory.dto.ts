import { z } from 'zod/v4';

export const CreateCategoryDtoSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255),
});

export type CreateCategoryDto = z.infer<typeof CreateCategoryDtoSchema>;
