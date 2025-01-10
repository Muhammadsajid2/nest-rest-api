import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow CORS (important for backend APIs)
  app.enableCors({
    origin: '*', // Allow all origins (or specify a list of allowed origins)
  });

  // Use Vercel's PORT environment variable or default to 3000
  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
