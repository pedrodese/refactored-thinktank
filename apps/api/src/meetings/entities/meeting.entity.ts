import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { Phase } from '../../phases/entities/phase.entity.js';

@Entity('meetings')
export class Meeting extends BaseEntity {
  @Column({ type: 'varchar', default: '' })
  abbreviation!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ name: 'phase_id', type: 'bigint', nullable: true })
  phaseId!: string | null;

  @ManyToOne(() => Phase, { nullable: true })
  @JoinColumn({ name: 'phase_id' })
  phase!: Phase | null;
}
