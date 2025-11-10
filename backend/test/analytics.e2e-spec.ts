import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AnalyticsController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/v1/analytics/dashboard (GET) - should return dashboard metrics', () => {
    return request(app.getHttpServer())
      .get('/api/v1/analytics/dashboard')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('revenue');
        expect(res.body).toHaveProperty('sales');
        expect(res.body).toHaveProperty('products');
        expect(res.body).toHaveProperty('customers');
        expect(res.body).toHaveProperty('serviceOrders');
      });
  });

  it('/v1/analytics/sales-chart (GET) - should return sales chart data', () => {
    return request(app.getHttpServer())
      .get('/api/v1/analytics/sales-chart?period=30d')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('labels');
        expect(res.body).toHaveProperty('data');
      });
  });

  it('/v1/analytics/top-products (GET) - should return top products', () => {
    return request(app.getHttpServer())
      .get('/api/v1/analytics/top-products?limit=10')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
});

