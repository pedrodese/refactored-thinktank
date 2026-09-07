import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMeetingDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  abbreviation?: string;

  @IsString()
  @IsNotEmpty()
  phaseId!: string;
}
