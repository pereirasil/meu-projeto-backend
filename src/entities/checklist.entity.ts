import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Card } from './card.entity';
import { ChecklistItem } from './checklist-item.entity';

@Entity('checklists')
export class Checklist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'card_id' })
  card_id: number;

  @Column({ type: 'integer', default: 0 })
  position: number;

  @CreateDateColumn()
  created_at: Date;

  // Relacionamentos
  @ManyToOne(() => Card, card => card.checklists)
  @JoinColumn({ name: 'card_id' })
  card: Card;

  @OneToMany(() => ChecklistItem, item => item.checklist)
  items: ChecklistItem[];
}
