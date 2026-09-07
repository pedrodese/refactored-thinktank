/**
 * `person` means somebody recorded in the system who does not log in. The other
 * four are the internal team.
 */
export type AuthorizationLevel = 'person' | 'secretary' | 'facilitator' | 'admin' | 'super_admin'
