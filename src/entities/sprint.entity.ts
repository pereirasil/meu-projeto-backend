import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Board } from './board.entity';

export enum SprintStatus {
  PLANNED = 'planejada',
  ACTIVE = 'ativa',
  COMPLETED = 'encerrada',
  CANCELLED = 'cancelada'
}

@Entity('sprints')
export class Sprint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({ type: 'date' })
  data_inicio: string;

  @Column({ type: 'date' })
  data_fim: string;

  @Column({
    type: 'enum',
    enum: SprintStatus,
    default: SprintStatus.PLANNED
  })
  status: SprintStatus;

  @Column()
  board_id: number;

  @ManyToOne(() => Board, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'board_id' })
  board: Board;

  @Column({ type: 'int', default: 0 })
  total_tasks: number;

  @Column({ type: 'int', default: 0 })
  tasks_concluidas: number;

  @Column({ type: 'int', default: 0 })
  tasks_em_andamento: number;

  @Column({ type: 'int', default: 0 })
  tasks_pendentes: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progresso: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
