import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SprintTask } from './sprint-task.entity';
import { User } from './user.entity';

@Entity('sprint_task_collaborators')
export class SprintTaskCollaborator {
  @PrimaryColumn()
  task_id: number;

  @PrimaryColumn()
  user_id: number;

  @ManyToOne(() => SprintTask, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: SprintTask;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
