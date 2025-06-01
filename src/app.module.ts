import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { VotacaoGateway } from './votacao.gateway'

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, VotacaoGateway],
})
export class AppModule {}
