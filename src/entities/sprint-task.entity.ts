import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Sprint } from './sprint.entity';
import { SprintColumn } from './sprint-column.entity';

export enum TaskStatus {
  PENDING = 'pendente',
  IN_PROGRESS = 'em_andamento',
  COMPLETED = 'concluida',
  CANCELLED = 'cancelada'
}

export enum TaskPriority {
  LOW = 'baixa',
  MEDIUM = 'media',
  HIGH = 'alta',
  URGENT = 'urgente'
}

@Entity('sprint_tasks')
export class SprintTask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sprint_id: number;

  @Column({ type: 'varchar', length: 255 })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM
  })
  prioridade: TaskPriority;

  @Column({ type: 'date', nullable: true })
  data_limite: string;

  @Column({ type: 'int', default: 0 })
  estimativa_horas: number;

  @Column({ type: 'int', nullable: true })
  column_id: number;

  @ManyToOne(() => Sprint, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sprint_id' })
  sprint: Sprint;

  @ManyToOne(() => SprintColumn, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'column_id' })
  column: SprintColumn;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
