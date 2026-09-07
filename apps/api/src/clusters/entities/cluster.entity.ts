import { Column, Entity, JoinColumn, ManyToOne, type ValueTransformer } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { Chapter } from '../../chapters/entities/chapter.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { WeekDay } from '../enums/week-day.enum.js';

// Postgres `time` volta como string "HH:MM:SS" do driver `pg` — a API só
// trabalha em "HH:MM" (igual ao accessor de app/models/cluster.rb).
const timeTransformer: ValueTransformer = {
  to: (value?: string | null) => value ?? null,
  from: (value?: string | null) => (value ? value.slice(0, 5) : value),
};

@Entity('clusters')
export class Cluster extends BaseEntity {
  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @Column({ type: 'varchar', nullable: true })
  address!: string | null;

  @Column({ name: 'auxiliary_facilitator_id', type: 'bigint', nullable: true })
  auxiliaryFacilitatorId!: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'auxiliary_facilitator_id' })
  auxiliaryFacilitator!: User | null;

  @Column({ name: 'chapter_id', type: 'bigint', nullable: true })
  chapterId!: string | null;

  @ManyToOne(() => Chapter, { nullable: true })
  @JoinColumn({ name: 'chapter_id' })
  chapter!: Chapter | null;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate!: string | null;

  @Column({ name: 'end_time', type: 'time', transformer: timeTransformer })
  endTime!: string;

  @Column({ name: 'facilitator_id', type: 'bigint', nullable: true })
  facilitatorId!: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'facilitator_id' })
  facilitator!: User | null;

  @Column({ type: 'text', nullable: true })
  link!: string | null;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate!: string | null;

  @Column({ name: 'start_time', type: 'time', transformer: timeTransformer })
  startTime!: string;

  @Column({ name: 'week_day', type: 'integer' })
  weekDay!: WeekDay;
}
