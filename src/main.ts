import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Logger } from '@nestjs/common';
import { ServerOptions } from 'socket.io';

class CustomIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: ['http://localhost:5000', 'http://192.168.0.127:5000', 'https://timeboard.site', 'https://app.timeboard.site'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
      },
      allowEIO3: true,
      transports: ['websocket', 'polling'],
    });
    return server;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  
  const port = parseInt(process.env.PORT || '3003', 10);
  const host = process.env.HOST || '0.0.0.0';
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  // Configuração do CORS
  const allowedOrigins = nodeEnv === 'production'
    ? ['https://timeboard.site', 'https://app.timeboard.site']
    : ['http://localhost:5000', 'http://192.168.0.127:5000'];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
  });

  // Configuração do WebSocket com adapter personalizado
  app.useWebSocketAdapter(new CustomIoAdapter(app));
  logger.log('WebSocket adapter configured with custom settings');

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