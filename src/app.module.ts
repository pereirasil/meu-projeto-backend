import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth.module';
import { BoardModule } from './modules/board.module';
import { ListModule } from './modules/list.module';
import { CardModule } from './modules/card.module';
import { TeamModule } from './modules/team.module';
import { VotingModule } from './modules/voting.module';
import { GitHubModule } from './modules/github.module';
import { SprintModule } from './modules/sprint.module';
import { TeamMemberModule } from './modules/team-member.module';
import { NotificationModule } from './modules/notification.module';

// Entidades
import { User } from './entities/user.entity';
import { Board } from './entities/board.entity';
import { List } from './entities/list.entity';
import { Card } from './entities/card.entity';
import { Label } from './entities/label.entity';
import { Checklist } from './entities/checklist.entity';
import { ChecklistItem } from './entities/checklist-item.entity';
import { Comment } from './entities/comment.entity';
import { BoardMember } from './entities/board-member.entity';
import { VotingRoom } from './entities/voting-room.entity';
import { VotingParticipant } from './entities/voting-participant.entity';
import { VotingVote } from './entities/voting-vote.entity';
import { VotingMessage } from './entities/voting-message.entity';
import { Sprint } from './entities/sprint.entity';
import { SprintTask } from './entities/sprint-task.entity';
import { SprintColumn } from './entities/sprint-column.entity';
import { SprintTaskCollaborator } from './entities/sprint-task-collaborator.entity';
import { TeamMember } from './entities/team-member.entity';
import { TeamInvite } from './entities/team-invite.entity';
import { Notification } from './entities/notification.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'timeboard_db',
          entities: [
            User,
            Board,
            List,
            Card,
            Label,
            Checklist,
            ChecklistItem,
            Comment,
            BoardMember,
            VotingRoom,
            VotingParticipant,
            VotingVote,
            VotingMessage,
            Sprint,
            SprintTask,
            SprintColumn,
            SprintTaskCollaborator,
            TeamMember,
            TeamInvite,
            Notification,
          ],
      synchronize: false, // Desabilitado para evitar conflitos
      logging: process.env.NODE_ENV !== 'production',
    }),
    AuthModule,
    BoardModule,
    ListModule,
    CardModule,
    TeamModule,
    VotingModule,
    GitHubModule,
    SprintModule,
    TeamMemberModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
