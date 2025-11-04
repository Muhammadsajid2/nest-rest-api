import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow CORS (important for backend APIs)
  app.enableCors({
    origin: '*', // Allow all origins (or specify a list of allowed origins)
  });

  // Use Vercel's PORT environment variable or default to 3000
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`🚀 TaskHive API is running on: http://localhost:${port}`);
}
bootstrap();
