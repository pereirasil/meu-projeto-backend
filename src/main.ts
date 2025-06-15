import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  
  const port = parseInt(process.env.PORT || '3003', 10);
  const host = process.env.HOST || '0.0.0.0';
  const nodeEnv = process.env.NODE_ENV || 'production';
  
  // Configuração do CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'https://timeboard.site',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  });

  // Configuração do WebSocket
  app.useWebSocketAdapter(new IoAdapter(app));
  logger.log('WebSocket adapter configured');

  // Configuração do Swagger apenas em desenvolvimento
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('API Documentation')
      .setDescription('Documentação da API do projeto')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
    logger.log('Swagger documentation enabled at /docs');
  }

  try {
    await app.listen(port, host);
    logger.log(`Application is running on: http://${host}:${port}`);
  } catch (error) {
    logger.error('Failed to start the application:', error.message);
    process.exit(1);
  }
}

bootstrap();