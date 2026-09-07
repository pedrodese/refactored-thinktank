import { IsBoolean, IsIn, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EDITION_YEARS } from '../chapters.constants.js';

export class CreateChapterDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsInt()
  @IsIn(EDITION_YEARS)
  editionYear!: number;

  @IsOptional()
  @IsBoolean()
  shared?: boolean;
}
