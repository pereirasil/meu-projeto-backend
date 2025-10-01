import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Board } from './board.entity';
import { Card } from './card.entity';
import { Comment } from './comment.entity';
import { BoardMember } from './board-member.entity';
import { VotingRoom } from './voting-room.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @Column({ type: 'text', nullable: true })
  avatar_url: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relacionamentos
  @OneToMany(() => Board, board => board.user)
  boards: Board[];

  @OneToMany(() => Card, card => card.assigned_user)
  assigned_cards: Card[];

  @OneToMany(() => Comment, comment => comment.user)
  comments: Comment[];

  @OneToMany(() => BoardMember, member => member.user)
  board_memberships: BoardMember[];

  @OneToMany(() => VotingRoom, room => room.creator)
  created_voting_rooms: VotingRoom[];
}
