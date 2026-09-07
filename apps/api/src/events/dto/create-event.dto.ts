import { IsISO8601, IsNotEmpty, IsOptional, IsString } from 'class-validator';

// Sem campos de avaliação (item_x_score/comment) de propósito: um evento
// nasce sem avaliação, preenchida depois via update — e as validações de
// comentário condicionadas ao score só existem `on: :update` no Rails
// mesmo, então replicar isso no create não teria efeito nenhum.
export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  teamId!: string;

  @IsString()
  @IsNotEmpty()
  meetingId!: string;

  @IsOptional()
  @IsISO8601()
  date?: string;
}
