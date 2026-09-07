import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';

@Entity('chapters')
export class Chapter extends BaseEntity {
  @Column({ type: 'varchar', nullable: true })
  title!: string | null;

  @Column({ name: 'edition_year', type: 'integer', nullable: true })
  editionYear!: number | null;

  @Column({ type: 'boolean', nullable: true })
  shared!: boolean | null;
}
