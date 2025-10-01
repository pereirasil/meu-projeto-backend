import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamController } from '../controllers/team.controller';
import { TeamService } from '../services/team.service';
import { User } from '../entities/user.entity';
import { BoardMember } from '../entities/board-member.entity';
import { Board } from '../entities/board.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, BoardMember, Board])],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}
