import { z } from 'zod/v4';

export const UpdateCategoryDtoSchema = z.object({
  name: z.string().min(1).max(255).optional(),
});

export type UpdateCategoryDto = z.infer<typeof UpdateCategoryDtoSchema>;
