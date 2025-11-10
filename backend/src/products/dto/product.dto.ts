export interface ProductDto {
  id: string;
  name: string;
  categoryId: number;
  stockQuantity: number;
  unitPrice: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  category?: {
    id: number;
    name: string;
  };
}
