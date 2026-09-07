import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';

@Entity('teams')
export class Team extends BaseEntity {
  @Column({ name: 'axis_id', type: 'bigint' })
  axisId!: string;

  @Column({ name: 'cluster_id', type: 'bigint', nullable: true })
  clusterId!: string | null;

  @Column({ name: 'link_miro', type: 'varchar', default: '' })
  linkMiro!: string;

  @Column({ name: 'link_teams', type: 'varchar', default: '' })
  linkTeams!: string;

  @Column({ type: 'varchar', default: '' })
  name!: string;
}
