import { z } from 'zod';
import { CreateServiceOrderSchema } from './create-service-order.dto';

export const UpdateServiceOrderSchema = CreateServiceOrderSchema.partial();

export type UpdateServiceOrderDto = z.infer<typeof UpdateServiceOrderSchema>;

