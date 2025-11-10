export interface CustomerReportItem {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  totalSpent: number;
  purchaseCount: number;
  averageTicket: number;
  lastVisit?: Date;
  customerType: string;
}

export interface CustomersReportDto {
  items: CustomerReportItem[];
  totals: {
    totalCustomers: number;
    totalRevenue: number;
    averageTicket: number;
    activeCustomers: number;
  };
}

