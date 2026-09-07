// Ordem exata de app/models/tool_event_assessment.rb — atenção: este enum
// SEM `nao_se_aplica`, diferente do score de Event (events/enums). Erro
// fácil de copiar o enum errado, então não compartilhar com EventScore.
export enum ToolAssessmentScore {
  PESSIMO = 0,
  RUIM = 1,
  BOM = 2,
  OTIMO = 3,
  SATISFATORIO = 4,
}

export const TOOL_ASSESSMENT_SCORE_LABEL: Record<ToolAssessmentScore, string> = {
  [ToolAssessmentScore.PESSIMO]: 'pessimo',
  [ToolAssessmentScore.RUIM]: 'ruim',
  [ToolAssessmentScore.BOM]: 'bom',
  [ToolAssessmentScore.OTIMO]: 'otimo',
  [ToolAssessmentScore.SATISFATORIO]: 'satisfatorio',
};

// Scores que exigem comentário preenchido (validado sempre, não só em
// update — diferente de Event).
export const TOOL_ASSESSMENT_COMMENT_REQUIRED_SCORES = [ToolAssessmentScore.PESSIMO, ToolAssessmentScore.RUIM];
