import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePhaseDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  toolIds?: string[];
}
