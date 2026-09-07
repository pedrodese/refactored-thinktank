// Ordem exata de app/models/member.rb (enum :role, %i[mm mp sol], prefix:
// true, default: :sol) — não reordenar, o valor inteiro persistido no banco
// depende desta ordem. O default de aplicação é SOL (não o 0/mm do default
// da coluna no Postgres — Rails sobrepõe o default a nível de model).
export enum MemberRole {
  MM = 0,
  MP = 1,
  SOL = 2,
}

export const MEMBER_ROLE_LABEL: Record<MemberRole, string> = {
  [MemberRole.MM]: 'mm',
  [MemberRole.MP]: 'mp',
  [MemberRole.SOL]: 'sol',
};

export const DEFAULT_MEMBER_ROLE = MemberRole.SOL;
