import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { VotingParticipant } from './voting-participant.entity';
import { VotingVote } from './voting-vote.entity';
import { VotingMessage } from './voting-message.entity';

@Entity('voting_rooms')
export class VotingRoom {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string; // UUID

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ name: 'created_by' })
  created_by: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relacionamentos
  @ManyToOne(() => User, user => user.created_voting_rooms)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => VotingParticipant, participant => participant.room)
  participants: VotingParticipant[];

  @OneToMany(() => VotingVote, vote => vote.room)
  votes: VotingVote[];

  @OneToMany(() => VotingMessage, message => message.room)
  messages: VotingMessage[];
}
