/** A partner organisation a person belongs to, identified by CNPJ. Empresa, in the interface. */
export interface Company {
  readonly id: string
  readonly name: string
  readonly cnpj: string
  readonly createdAt: string
  readonly updatedAt: string
}
