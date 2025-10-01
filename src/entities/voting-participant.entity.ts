import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { VotingRoom } from './voting-room.entity';

@Entity('voting_participants')
export class VotingParticipant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'room_id', type: 'varchar', length: 36 })
  room_id: string;

  @Column({ type: 'varchar', length: 255 })
  user_name: string;

  @Column({ type: 'varchar', length: 50, default: 'participant' })
  user_role: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar_url: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  socket_id: string;

  @Column({ type: 'boolean', default: true })
  is_connected: boolean;

  @CreateDateColumn()
  joined_at: Date;

  // Relacionamentos
  @ManyToOne(() => VotingRoom, room => room.participants)
  @JoinColumn({ name: 'room_id' })
  room: VotingRoom;
}
