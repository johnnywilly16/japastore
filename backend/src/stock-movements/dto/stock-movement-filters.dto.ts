export interface StockMovementFilters {
  type?: 'addition' | 'removal';
  productId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

