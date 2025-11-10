export interface DailySessionDto {
  id: string;
  date: string;
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'completed' | 'cancelled';
  totalSales: number;
  salesCount: number;
  notes?: string;
  duration?: number; // em minutos
  createdAt: Date;
  updatedAt: Date;
}
