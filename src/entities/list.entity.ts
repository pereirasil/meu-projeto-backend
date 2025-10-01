import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Board } from './board.entity';
import { Card } from './card.entity';

@Entity('lists')
export class List {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'board_id' })
  board_id: number;

  @Column({ type: 'integer', default: 0 })
  position: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relacionamentos
  @ManyToOne(() => Board, board => board.lists)
  @JoinColumn({ name: 'board_id' })
  board: Board;

  @OneToMany(() => Card, card => card.list)
  cards: Card[];
}
