import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VotingController } from '../controllers/voting.controller';
import { VotingService } from '../services/voting.service';
import { VotacaoGateway } from '../gateways/votacao.gateway';
import { VotingRoom } from '../entities/voting-room.entity';
import { VotingParticipant } from '../entities/voting-participant.entity';
import { VotingVote } from '../entities/voting-vote.entity';
import { VotingMessage } from '../entities/voting-message.entity';
import { AuthModule } from './auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VotingRoom,
      VotingParticipant,
      VotingVote,
      VotingMessage,
    ]),
    AuthModule,
  ],
  controllers: [VotingController],
  providers: [VotingService, VotacaoGateway],
  exports: [VotingService],
})
export class VotingModule {}
