export interface ChartDataDto {
  labels: string[];
  data: number[];
}

export interface TopProductDto {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
}

export interface TopCustomerDto {
  id: string;
  name: string;
  totalSpent: number;
  purchaseCount: number;
}

export interface RevenueByCategoryDto {
  categoryId: string;
  categoryName: string;
  revenue: number;
  salesCount: number;
}

