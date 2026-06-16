import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // CORS for Chrome Extension
  app.enableCors({
    origin: (origin, callback) => {
      // Allow Chrome extension origins and localhost in development
      const allowed =
        !origin ||
        origin.startsWith('chrome-extension://') ||
        origin.startsWith('http://localhost') ||
        origin.startsWith('https://localhost');
      callback(null, allowed);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Swagger docs
  const config = new DocumentBuilder()
    .setTitle('DSA Code Analyzer API')
    .setDescription('Analyzes DSA code to detect language, approach, and complexity')
    .setVersion('1.0')
    .addTag('analysis')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 DSA Analyzer API running on: http://localhost:${port}`);
  console.log(`📖 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
