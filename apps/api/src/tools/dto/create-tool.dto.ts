import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateToolDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  phaseIds?: string[];
}
