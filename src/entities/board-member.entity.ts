import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Board } from './board.entity';
import { User } from './user.entity';

@Entity('board_members')
export class BoardMember {
  @PrimaryColumn({ name: 'board_id' })
  board_id: number;

  @PrimaryColumn({ name: 'user_id' })
  user_id: number;

  @Column({ type: 'varchar', length: 20, default: 'member' })
  role: 'owner' | 'admin' | 'member';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  joined_at: Date;

  // Relacionamentos
  @ManyToOne(() => Board, board => board.members)
  @JoinColumn({ name: 'board_id' })
  board: Board;

  @ManyToOne(() => User, user => user.board_memberships)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
