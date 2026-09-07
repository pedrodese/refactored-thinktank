import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { Tool } from '../../tools/entities/tool.entity.js';
import { ToolAssessmentScore } from '../enums/tool-assessment-score.enum.js';

@Entity('tool_event_assessments')
export class ToolEventAssessment extends BaseEntity {
  @Column({ type: 'text', default: '' })
  comment!: string;

  @Column({ name: 'event_id', type: 'bigint' })
  eventId!: string;

  @Column({ type: 'integer', default: ToolAssessmentScore.PESSIMO })
  score!: ToolAssessmentScore;

  @Column({ name: 'tool_id', type: 'bigint' })
  toolId!: string;

  @ManyToOne(() => Tool)
  @JoinColumn({ name: 'tool_id' })
  tool!: Tool;
}
