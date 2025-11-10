export interface InventoryReportItem {
  id: string;
  name: string;
  categoryName: string;
  stockQuantity: number;
  unitPrice: number;
  totalValue: number;
  movementsCount: number;
  lastMovementDate?: Date;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface InventoryReportDto {
  items: InventoryReportItem[];
  totals: {
    totalProducts: number;
    totalStockValue: number;
    totalItems: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
}

