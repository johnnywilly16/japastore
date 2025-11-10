import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ServiceOrdersController (e2e)', () => {
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

  it('/v1/service-orders (GET) - should return list of service orders', () => {
    return request(app.getHttpServer())
      .get('/api/v1/service-orders')
      .expect(200);
  });

  it('/v1/service-orders (POST) - should create a service order', () => {
    const createDto = {
      customerId: 'test-customer-uuid',
      deviceModel: 'iPhone 13',
      problem: 'Tela quebrada',
      priority: 'high',
    };

    return request(app.getHttpServer())
      .post('/api/v1/service-orders')
      .send(createDto)
      .expect(201);
  });
});

