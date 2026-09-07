import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';
import { Company } from '../../companies/entities/company.entity.js';
import { AuthorizationLevel, INTERNAL_TEAM_LEVELS } from '../enums/authorization-level.enum.js';
import { Gender } from '../enums/gender.enum.js';

@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'varchar', default: '' })
  address!: string;

  @Column({ type: 'integer', default: AuthorizationLevel.PERSON })
  authorizationLevel!: AuthorizationLevel;

  @Column({ type: 'date', nullable: true })
  birthday!: string | null;

  @Column({ type: 'varchar', default: '' })
  celularNumber!: string;

  @Column({ type: 'bigint', nullable: true })
  companyId!: string | null;

  @ManyToOne(() => Company, (company) => company.users, { nullable: true })
  @JoinColumn({ name: 'company_id' })
  company!: Company | null;

  @Column({ type: 'varchar', nullable: true, default: '' })
  cpf!: string | null;

  @Column({ type: 'varchar', default: '' })
  email!: string;

  @Column({ type: 'varchar', default: '' })
  encryptedPassword!: string;

  @Column({ type: 'varchar' })
  fullName!: string;

  @Column({ type: 'integer', default: Gender.OTHER })
  gender!: Gender;

  @Column({ type: 'varchar', default: '' })
  nickname!: string;

  @Column({ type: 'varchar', default: '' })
  phoneNumber!: string;

  @Column({ type: 'varchar', nullable: true, default: '' })
  rg!: string | null;

  @Column({ type: 'varchar', default: '' })
  secondaryEmail!: string;

  get internalTeam(): boolean {
    return INTERNAL_TEAM_LEVELS.includes(this.authorizationLevel);
  }
}
