import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';

@Entity('axes')
export class Axis extends BaseEntity {
  @Column({ type: 'varchar', default: '' })
  title!: string;

  @Column({ type: 'text', default: '' })
  description!: string;
}
