// Must load before any import that instantiates a PrismaClient/adapter
// at module scope (see PrismaService), which read process.env on import.
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new AllExceptionsFilter());

  // Sets the standard security headers (X-Content-Type-Options, HSTS,
  // X-Frame-Options, etc). Safe defaults for a pure JSON API - this app has
  // no view engine or served HTML for its default CSP to interfere with.
  app.use(helmet());

  // Native clients (Expo Go/React Native) don't enforce CORS, but the web
  // target does - without this the browser blocks every request at the
  // OPTIONS preflight. CORS_ORIGINS must list every browser origin allowed
  // to call this API (comma-separated); set it explicitly per environment
  // rather than opening it to any origin.
  const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:3001')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Health checks live at the bare /health path, outside the /api prefix -
  // deployment tooling (Dokploy, load balancers) shouldn't need to know
  // about API versioning/prefixing just to probe liveness.
  app.setGlobalPrefix('api', { exclude: ['health'] });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
