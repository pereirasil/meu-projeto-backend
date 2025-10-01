import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user.entity';
import { List } from './list.entity';
import { Label } from './label.entity';
import { BoardMember } from './board-member.entity';

@Entity('boards')
export class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ type: 'boolean', default: false })
  is_public: boolean;

  @Column({ type: 'varchar', length: 50, default: '#0079bf' })
  color: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relacionamentos
  @ManyToOne(() => User, user => user.boards)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => List, list => list.board)
  lists: List[];

  @OneToMany(() => Label, label => label.board)
  labels: Label[];

  @OneToMany(() => BoardMember, member => member.board)
  members: BoardMember[];
}
