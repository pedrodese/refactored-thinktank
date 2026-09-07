import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { Member } from '../../members/entities/member.entity.js';
import { AttendanceStatus } from '../enums/status.enum.js';

@Entity('attendances')
export class Attendance extends BaseEntity {
  @Column({ name: 'event_id', type: 'bigint' })
  eventId!: string;

  @Column({ name: 'member_id', type: 'bigint' })
  memberId!: string;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'member_id' })
  member!: Member;

  @Column({ type: 'text', default: '' })
  reason!: string;

  @Column({ type: 'integer', default: AttendanceStatus.NOT_REGISTERED })
  status!: AttendanceStatus;
}
