import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { env } from './configs/config.env';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  });
  app.useGlobalInterceptors(new TransformInterceptor());
  app.enableVersioning();
  app.set('trust proxy', true);
  app.setGlobalPrefix('api');
  app.use(cookieParser());

  await app.listen(env.SERVER_PORT ?? 3001);
}
void bootstrap();
