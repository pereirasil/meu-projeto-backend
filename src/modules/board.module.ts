import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardService } from '../services/board.service';
import { BoardController } from '../controllers/board.controller';
import { Board } from '../entities/board.entity';
import { List } from '../entities/list.entity';
import { Label } from '../entities/label.entity';
import { BoardMember } from '../entities/board-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Board, List, Label, BoardMember])],
  providers: [BoardService],
  controllers: [BoardController],
  exports: [BoardService],
})
export class BoardModule {}
