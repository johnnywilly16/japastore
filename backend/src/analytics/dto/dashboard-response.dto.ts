export interface RevenueMetrics {
  total: number;
  today: number;
  thisMonth: number;
  lastMonth: number;
  growth: number; // percentage
}

export interface SalesMetrics {
  total: number;
  today: number;
  thisMonth: number;
  avgTicket: number;
}

export interface ProductsMetrics {
  total: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
}

export interface CustomersMetrics {
  total: number;
  active: number;
  new: number;
  atRisk: number;
}

export interface ServiceOrdersMetrics {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}

export interface DashboardResponseDto {
  revenue: RevenueMetrics;
  sales: SalesMetrics;
  products: ProductsMetrics;
  customers: CustomersMetrics;
  serviceOrders: ServiceOrdersMetrics;
}

