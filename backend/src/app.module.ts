import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { DailySessionsModule } from './daily-sessions/daily-sessions.module';
import { CustomersModule } from './customers/customers.module';
import { ContactsModule } from './contacts/contacts.module';
import { ServiceOrdersModule } from './service-orders/service-orders.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { StockMovementsModule } from './stock-movements/stock-movements.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    UsersModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    DailySessionsModule,
    CustomersModule,
    ContactsModule,
    ServiceOrdersModule,
    AnalyticsModule,
    StockMovementsModule,
    ReportsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
