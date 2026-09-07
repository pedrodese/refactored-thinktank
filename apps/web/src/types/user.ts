/**
 * A person recorded in the system, not necessarily somebody who signs in: at
 * the `person` level there are no credentials at all. Pessoa, in the interface.
 *
 * Shape matches UserResponseDto da API 1:1 — sem os campos calculados que o
 * Rails mandava antes (path/editPath/canDestroy/teamNames): esses eram só
 * conveniência de UI, e a API nova não os expõe.
 */
export interface User {
  readonly id: string
  readonly fullName: string
  readonly authorizationLevel: string
  readonly email: string
  readonly secondaryEmail: string
  readonly gender: string
  readonly birthday: string | null
  readonly nickname: string
  readonly cpf: string | null
  readonly rg: string | null
  readonly address: string
  readonly celularNumber: string
  readonly phoneNumber: string
  readonly companyId: string | null
  readonly createdAt: string
  readonly updatedAt: string
}
