// Ordem exata de app/models/user.rb no projeto Rails original — não reordenar,
// o valor inteiro persistido no banco depende desta ordem.
export enum AuthorizationLevel {
  PERSON = 0,
  SECRETARY = 1,
  FACILITATOR = 2,
  ADMIN = 3,
  SUPER_ADMIN = 4,
}

export const INTERNAL_TEAM_LEVELS = [
  AuthorizationLevel.SECRETARY,
  AuthorizationLevel.FACILITATOR,
  AuthorizationLevel.ADMIN,
  AuthorizationLevel.SUPER_ADMIN,
];
