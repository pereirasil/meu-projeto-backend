import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Board } from './board.entity';
import { TeamRole } from './team-member.entity';

export enum InviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired'
}

@Entity('team_invites')
export class TeamInvite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  email: string;

  @Column()
  board_id: number;

  @Column({
    type: 'enum',
    enum: TeamRole,
    default: TeamRole.MEMBER
  })
  role: TeamRole;

  @Column({ length: 255, unique: true })
  token: string;

  @Column({ type: 'datetime' })
  expires_at: Date;

  @Column({
    type: 'enum',
    enum: InviteStatus,
    default: InviteStatus.PENDING
  })
  status: InviteStatus;

  @Column({ type: 'int', nullable: true })
  invited_by: number;

  @ManyToOne(() => Board, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'board_id' })
  board: Board;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
