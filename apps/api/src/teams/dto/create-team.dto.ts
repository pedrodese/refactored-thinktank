import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  axisId!: string;

  @IsString()
  @IsNotEmpty()
  clusterId!: string;

  // Formato/normalização (allow_blank + prefixo https://) ficam no service,
  // junto com a mesma lógica de before_save_format_links_callback do Rails.
  @IsOptional()
  @IsString()
  linkMiro?: string;

  @IsOptional()
  @IsString()
  linkTeams?: string;
}
