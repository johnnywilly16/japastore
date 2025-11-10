export interface ProductReportItem {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  stockQuantity: number;
  unitPrice: number;
  totalValue: number;
  salesCount: number;
  revenue: number;
  margin?: number;
}

export interface ProductsReportDto {
  items: ProductReportItem[];
  totals: {
    totalProducts: number;
    totalStockValue: number;
    totalRevenue: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
}

