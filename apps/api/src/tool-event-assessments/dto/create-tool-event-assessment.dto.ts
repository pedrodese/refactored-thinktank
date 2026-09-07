import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ToolAssessmentScore } from '../enums/tool-assessment-score.enum.js';

export class CreateToolEventAssessmentDto {
  @IsString()
  @IsNotEmpty()
  toolId!: string;

  @IsEnum(ToolAssessmentScore)
  score!: ToolAssessmentScore;

  // Obrigatório quando score é pessimo/ruim — validado no service (depende
  // do valor final combinado).
  @IsOptional()
  @IsString()
  @MaxLength(280)
  comment?: string;
}
