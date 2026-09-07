import { IsBoolean, IsEnum, IsISO8601, IsOptional, IsString, MaxLength } from 'class-validator';
import { EventScore } from '../enums/event-score.enum.js';

export class UpdateEventDto {
  // Só tem efeito se meetingId NÃO estiver mudando nesta mesma requisição —
  // igual Event#sync_name_from_meeting do Rails, que sempre resincroniza o
  // nome a partir do Meeting quando o meeting muda.
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  meetingId?: string;

  @IsOptional()
  @IsString()
  teamId?: string;

  @IsOptional()
  @IsISO8601()
  date?: string;

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

  // Equivalente ao param `go_to_next` do Rails: força a validação completa
  // (scores obrigatórios + attendances registradas) e, se salvar com
  // sucesso, o response inclui o próximo evento pendente da equipe.
  @IsOptional()
  @IsBoolean()
  goToNext?: boolean;
}
