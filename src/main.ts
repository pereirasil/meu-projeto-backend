import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const port = parseInt(process.env.PORT || '5001', 10);
  const host = process.env.HOST || '0.0.0.0';
  
  // Configuração do CORS
  app.enableCors({
    origin: ['http://localhost:5002', 'http://192.168.0.127:5002'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Configuração do WebSocket
  app.useWebSocketAdapter(new IoAdapter(app));

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('Documentação da API do projeto')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port, host);
  console.log(`Application is running on: http://${host}:${port}`);
}

bootstrap();
