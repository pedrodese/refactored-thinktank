import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';

@Entity('tools')
export class Tool extends BaseEntity {
  @Column({ type: 'varchar', nullable: true })
  name!: string | null;
}
