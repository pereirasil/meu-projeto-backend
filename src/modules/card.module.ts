import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardController } from '../controllers/card.controller';
import { CardService } from '../services/card.service';
import { Card } from '../entities/card.entity';
import { List } from '../entities/list.entity';
import { Board } from '../entities/board.entity';
import { BoardMember } from '../entities/board-member.entity';
import { Label } from '../entities/label.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Card, List, Board, BoardMember, Label])],
  controllers: [CardController],
  providers: [CardService],
  exports: [CardService],
})
export class CardModule {}
