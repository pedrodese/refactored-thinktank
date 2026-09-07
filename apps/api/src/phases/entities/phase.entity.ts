import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';

@Entity('phases')
export class Phase extends BaseEntity {
  @Column({ type: 'varchar', default: '' })
  name!: string;
}
