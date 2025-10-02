import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SprintController } from '../controllers/sprint.controller';
import { SprintService } from '../services/sprint.service';
import { Sprint } from '../entities/sprint.entity';
import { SprintTask } from '../entities/sprint-task.entity';
import { SprintColumn } from '../entities/sprint-column.entity';
import { SprintTaskCollaborator } from '../entities/sprint-task-collaborator.entity';
import { Board } from '../entities/board.entity';
import { List } from '../entities/list.entity';
import { Card } from '../entities/card.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sprint, SprintTask, SprintColumn, SprintTaskCollaborator, Board, List, Card])],
  controllers: [SprintController],
  providers: [SprintService],
  exports: [SprintService],
})
export class SprintModule {}
