import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Checklist } from './checklist.entity';

@Entity('checklist_items')
export class ChecklistItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  text: string;

  @Column({ type: 'boolean', default: false })
  is_completed: boolean;

  @Column({ name: 'checklist_id' })
  checklist_id: number;

  @Column({ type: 'integer', default: 0 })
  position: number;

  @CreateDateColumn()
  created_at: Date;

  // Relacionamentos
  @ManyToOne(() => Checklist, checklist => checklist.items)
  @JoinColumn({ name: 'checklist_id' })
  checklist: Checklist;
}
