import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListController } from '../controllers/list.controller';
import { ListService } from '../services/list.service';
import { List } from '../entities/list.entity';
import { Board } from '../entities/board.entity';
import { BoardMember } from '../entities/board-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([List, Board, BoardMember])],
  controllers: [ListController],
  providers: [ListService],
  exports: [ListService],
})
export class ListModule {}
