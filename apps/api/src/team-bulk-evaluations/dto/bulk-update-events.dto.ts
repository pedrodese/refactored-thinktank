import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { EventScore } from '../../events/enums/event-score.enum.js';

// Só os campos de avaliação (igual PERMITTED_ASSESSMENT_ATTRIBUTES do
// Rails) — attendances e tool-event-assessments continuam editadas pelos
// próprios sub-recursos (mesma decisão de não replicar nested-attributes já
// tomada pra Team.members na Fase 3).
export class BulkEventUpdateItemDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  generalComments?: string;

  @IsOptional()
  @IsEnum(EventScore)
  itemAScore?: EventScore;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  itemAComment?: string;

  @IsOptional()
  @IsEnum(EventScore)
  itemBScore?: EventScore;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  itemBComment?: string;

  @IsOptional()
  @IsEnum(EventScore)
  itemCScore?: EventScore;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  itemCComment?: string;

  @IsOptional()
  @IsEnum(EventScore)
  itemDScore?: EventScore;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  itemDComment?: string;
}

export class BulkUpdateEventsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkEventUpdateItemDto)
  events!: BulkEventUpdateItemDto[];
}
