import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { List } from './list.entity';
import { User } from './user.entity';
import { Label } from './label.entity';
import { Checklist } from './checklist.entity';
import { Comment } from './comment.entity';

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'list_id' })
  list_id: number;

  @Column({ type: 'integer', default: 0 })
  position: number;

  @Column({ type: 'timestamp', nullable: true })
  due_date: Date;

  @Column({ type: 'varchar', length: 20, default: 'medium' })
  priority: 'low' | 'medium' | 'high';

  @Column({ name: 'assigned_user_id', nullable: true })
  assigned_user_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relacionamentos
  @ManyToOne(() => List, list => list.cards)
  @JoinColumn({ name: 'list_id' })
  list: List;

  @ManyToOne(() => User, user => user.assigned_cards)
  @JoinColumn({ name: 'assigned_user_id' })
  assigned_user: User;

  @ManyToMany(() => Label)
  @JoinTable({
    name: 'card_labels',
    joinColumn: { name: 'card_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'label_id', referencedColumnName: 'id' }
  })
  labels: Label[];

  @OneToMany(() => Checklist, checklist => checklist.card)
  checklists: Checklist[];

  @OneToMany(() => Comment, comment => comment.card)
  comments: Comment[];
}
