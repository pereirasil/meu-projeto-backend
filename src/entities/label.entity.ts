import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Board } from './board.entity';

@Entity('labels')
export class Label {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  color: string;

  @Column({ name: 'board_id' })
  board_id: number;

  @CreateDateColumn()
  created_at: Date;

  // Relacionamentos
  @ManyToOne(() => Board, board => board.labels)
  @JoinColumn({ name: 'board_id' })
  board: Board;
}
