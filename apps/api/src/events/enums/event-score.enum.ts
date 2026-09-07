// Ordem exata de app/models/event.rb (SCORE_OPTIONS, usada nos 4 enums
// item_a-d_score) — não reordenar, o valor inteiro persistido no banco
// depende desta ordem. Note: inclui `nao_se_aplica`, diferente do enum de
// score de ToolEventAssessment (ver tool-event-assessments/enums).
export enum EventScore {
  PESSIMO = 0,
  RUIM = 1,
  BOM = 2,
  OTIMO = 3,
  SATISFATORIO = 4,
  NAO_SE_APLICA = 5,
}

export const EVENT_SCORE_LABEL: Record<EventScore, string> = {
  [EventScore.PESSIMO]: 'pessimo',
  [EventScore.RUIM]: 'ruim',
  [EventScore.BOM]: 'bom',
  [EventScore.OTIMO]: 'otimo',
  [EventScore.SATISFATORIO]: 'satisfatorio',
  [EventScore.NAO_SE_APLICA]: 'nao_se_aplica',
};

// Scores que exigem comentário preenchido (só validado em update — ver
// app/models/event.rb, validations `on: :update`).
export const EVENT_COMMENT_REQUIRED_SCORES = [EventScore.PESSIMO, EventScore.RUIM, EventScore.NAO_SE_APLICA];
