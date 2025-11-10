export interface ServiceOrderReportItem {
  id: string;
  customerId: string;
  customerName: string;
  deviceModel: string;
  problem: string;
  status: string;
  priority: string;
  totalCost: number;
  estimatedCost?: number;
  createdAt: Date;
  completionDate?: Date;
  daysToComplete?: number;
}

export interface ServiceOrdersReportDto {
  items: ServiceOrderReportItem[];
  totals: {
    totalOrders: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    totalRevenue: number;
    averageTimeToComplete?: number;
  };
  period: {
    startDate?: Date;
    endDate?: Date;
  };
}

