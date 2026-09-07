import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { EventScore } from '../enums/event-score.enum.js';

@Entity('events')
export class Event extends BaseEntity {
  @Column({ type: 'date' })
  date!: string;

  @Column({ name: 'general_comments', type: 'text', default: '' })
  generalComments!: string;

  @Column({ name: 'item_a_comment', type: 'text', default: '' })
  itemAComment!: string;

  @Column({ name: 'item_a_score', type: 'integer', nullable: true })
  itemAScore!: EventScore | null;

  @Column({ name: 'item_b_comment', type: 'text', default: '' })
  itemBComment!: string;

  @Column({ name: 'item_b_score', type: 'integer', nullable: true })
  itemBScore!: EventScore | null;

  @Column({ name: 'item_c_comment', type: 'text', default: '' })
  itemCComment!: string;

  @Column({ name: 'item_c_score', type: 'integer', nullable: true })
  itemCScore!: EventScore | null;

  @Column({ name: 'item_d_comment', type: 'text', default: '' })
  itemDComment!: string;

  @Column({ name: 'item_d_score', type: 'integer', nullable: true })
  itemDScore!: EventScore | null;

  @Column({ name: 'meeting_id', type: 'bigint' })
  meetingId!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ name: 'team_id', type: 'bigint' })
  teamId!: string;
}
