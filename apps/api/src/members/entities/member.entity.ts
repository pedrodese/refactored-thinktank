import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { MemberModality } from '../enums/modality.enum.js';
import { DEFAULT_MEMBER_ROLE, MemberRole } from '../enums/role.enum.js';

@Entity('members')
export class Member extends BaseEntity {
  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @Column({ type: 'integer', nullable: true, default: MemberModality.PRESENCIAL })
  modality!: MemberModality | null;

  @Column({ type: 'integer', default: DEFAULT_MEMBER_ROLE })
  role!: MemberRole;

  @Column({ name: 'team_id', type: 'bigint' })
  teamId!: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
