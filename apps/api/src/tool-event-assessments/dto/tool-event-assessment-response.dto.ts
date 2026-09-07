import { TOOL_ASSESSMENT_SCORE_LABEL } from '../enums/tool-assessment-score.enum.js';
import { ToolEventAssessment } from '../entities/tool-event-assessment.entity.js';

export class ToolEventAssessmentResponseDto {
  id!: string;
  eventId!: string;
  toolId!: string;
  score!: string;
  comment!: string;
  tool?: { id: string; name: string | null };
  createdAt!: Date;
  updatedAt!: Date;

  static fromEntity(assessment: ToolEventAssessment): ToolEventAssessmentResponseDto {
    const dto = new ToolEventAssessmentResponseDto();
    dto.id = assessment.id;
    dto.eventId = assessment.eventId;
    dto.toolId = assessment.toolId;
    dto.score = TOOL_ASSESSMENT_SCORE_LABEL[assessment.score];
    dto.comment = assessment.comment;
    if (assessment.tool) dto.tool = { id: assessment.tool.id, name: assessment.tool.name };
    dto.createdAt = assessment.createdAt;
    dto.updatedAt = assessment.updatedAt;
    return dto;
  }
}
