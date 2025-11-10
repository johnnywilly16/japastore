import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ReportsController (e2e)', () => {
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

  it('/v1/reports/sales (GET) - should return sales report', () => {
    return request(app.getHttpServer())
      .get('/api/v1/reports/sales')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('items');
        expect(res.body).toHaveProperty('totals');
      });
  });

  it('/v1/reports/products (GET) - should return products report', () => {
    return request(app.getHttpServer())
      .get('/api/v1/reports/products')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('items');
        expect(res.body).toHaveProperty('totals');
      });
  });

  it('/v1/reports/customers (GET) - should return customers report', () => {
    return request(app.getHttpServer())
      .get('/api/v1/reports/customers')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('items');
        expect(res.body).toHaveProperty('totals');
      });
  });
});

