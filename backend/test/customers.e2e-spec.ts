import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('CustomersController (e2e)', () => {
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

  it('/customers (GET) - should return list of customers', () => {
    return request(app.getHttpServer())
      .get('/api/customers')
      .expect(200);
  });

  it('/customers/:id (GET) - should return a customer by id', () => {
    return request(app.getHttpServer())
      .get('/api/customers/test-uuid')
      .expect(200);
  });

  it('/customers/:id/visits (GET) - should return customer visits', () => {
    return request(app.getHttpServer())
      .get('/api/customers/test-uuid/visits')
      .expect(200);
  });
});

