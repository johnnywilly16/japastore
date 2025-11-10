export interface ServiceOrderCostDto {
  id: number;
  description: string;
  value: number;
  quantity: number;
  type: 'stock_product' | 'external_service';
  productId?: string;
  product?: {
    id: string;
    name: string;
  };
  createdAt: Date;
}

export interface ServiceOrderResponseDto {
  id: string;
  customerId: string;
  customer: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  deviceModel: string;
  problem: string;
  estimatedCost?: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  completionDate?: Date;
  totalCost: number;
  costs: ServiceOrderCostDto[];
  createdAt: Date;
  updatedAt: Date;
}

