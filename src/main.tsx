// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   await app.listen(3001); // Porta padrão 3000
// }

// bootstrap();


import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const PORT = process.env.PORT || 3000; // Usar a porta definida pelo Vercel ou 3000 como fallback
  await app.listen(PORT); // Porta padrão do Vercel (3000 ou definida pelo Vercel)
  console.log(`Servidor rodando na porta ${PORT}`);
}

bootstrap();
