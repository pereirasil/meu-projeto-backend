import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { VotingRoom } from './voting-room.entity';

@Entity('voting_votes')
export class VotingVote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'room_id', type: 'varchar', length: 36 })
  room_id: string;

  @Column({ type: 'varchar', length: 255 })
  user_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  socket_id: string;

  @Column({ type: 'integer' })
  vote_value: number;

  @Column({ type: 'boolean', default: false })
  is_revealed: boolean;

  @CreateDateColumn()
  created_at: Date;

  // Relacionamentos
  @ManyToOne(() => VotingRoom, room => room.votes)
  @JoinColumn({ name: 'room_id' })
  room: VotingRoom;
}
