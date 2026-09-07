import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity.js';

// Tabela de junção da N:N Phase<->Tool (HABTM no Rails). Sem decorators de
// relação pra Phase/Tool de propósito: evita import cruzado entre os módulos
// `phases` e `tools`, que gerenciam essa tabela cada um do seu lado.
@Entity('phases_tools')
export class PhaseTool extends BaseEntity {
  @Column({ name: 'phase_id', type: 'bigint' })
  phaseId!: string;

  @Column({ name: 'tool_id', type: 'bigint' })
  toolId!: string;
}
