import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VotacaoGateway } from './gateways/votacao.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, VotacaoGateway],
})
export class AppModule {}
