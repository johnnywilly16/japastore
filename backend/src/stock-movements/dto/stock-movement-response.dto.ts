export interface StockMovementResponseDto {
  id: number;
  productId: string;
  product: {
    id: string;
    name: string;
  };
  movementType: 'addition' | 'removal';
  referenceType: 'serviceOrder' | 'purchase' | 'sale';
  referenceId: number;
  quantity: number;
  unitPrice: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovementStatsDto {
  totalAdditions: number;
  totalRemovals: number;
  additionsByPeriod: number;
  removalsByPeriod: number;
  period: string;
}

