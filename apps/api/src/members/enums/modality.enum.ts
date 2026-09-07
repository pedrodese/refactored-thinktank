// Ordem exata de app/models/member.rb (enum :modality, %i[presencial online
// hibrido]) — não reordenar, o valor inteiro persistido no banco depende
// desta ordem.
export enum MemberModality {
  PRESENCIAL = 0,
  ONLINE = 1,
  HIBRIDO = 2,
}

export const MEMBER_MODALITY_LABEL: Record<MemberModality, string> = {
  [MemberModality.PRESENCIAL]: 'presencial',
  [MemberModality.ONLINE]: 'online',
  [MemberModality.HIBRIDO]: 'hibrido',
};
