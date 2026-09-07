// Ordem exata de app/models/cluster.rb (enum :week_day, %i[segunda terca
// quarta quinta sexta sabado domingo]) — não reordenar, o valor inteiro
// persistido no banco depende desta ordem.
export enum WeekDay {
  SEGUNDA = 0,
  TERCA = 1,
  QUARTA = 2,
  QUINTA = 3,
  SEXTA = 4,
  SABADO = 5,
  DOMINGO = 6,
}

export const WEEK_DAY_LABEL: Record<WeekDay, string> = {
  [WeekDay.SEGUNDA]: 'segunda',
  [WeekDay.TERCA]: 'terca',
  [WeekDay.QUARTA]: 'quarta',
  [WeekDay.QUINTA]: 'quinta',
  [WeekDay.SEXTA]: 'sexta',
  [WeekDay.SABADO]: 'sabado',
  [WeekDay.DOMINGO]: 'domingo',
};
