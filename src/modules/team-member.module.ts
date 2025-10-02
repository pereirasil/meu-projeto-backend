import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamMemberController } from '../controllers/team-member.controller';
import { TeamMemberService } from '../services/team-member.service';
import { TeamMember } from '../entities/team-member.entity';
import { TeamInvite } from '../entities/team-invite.entity';
import { User } from '../entities/user.entity';
import { Board } from '../entities/board.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TeamMember, TeamInvite, User, Board])],
  controllers: [TeamMemberController],
  providers: [TeamMemberService],
  exports: [TeamMemberService],
})
export class TeamMemberModule {}
