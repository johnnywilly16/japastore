export interface SaleReportItem {
  id: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  discount: number;
  paymentMethod: string;
  saleDate: Date;
}

export interface SalesReportDto {
  items: SaleReportItem[];
  totals: {
    totalSales: number;
    totalRevenue: number;
    totalDiscount: number;
    averageTicket: number;
  };
  period: {
    startDate?: Date;
    endDate?: Date;
  };
}

