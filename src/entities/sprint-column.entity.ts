import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { Sprint } from './sprint.entity';
import { SprintTask } from './sprint-task.entity';

@Entity('sprint_columns')
export class SprintColumn {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sprint_id: number;

  @Column({ type: 'varchar', length: 100 })
  nome: string;

  @Column({ type: 'int', default: 0 })
  ordem: number;

  @ManyToOne(() => Sprint, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sprint_id' })
  sprint: Sprint;

  @OneToMany(() => SprintTask, task => task.column)
  tasks: SprintTask[];

  @CreateDateColumn()
  created_at: Date;
}
