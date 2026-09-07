import { IsBoolean, IsEnum, IsISO8601, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { TIME_FORMAT_REGEX } from '../clusters.constants.js';
import { WeekDay } from '../enums/week-day.enum.js';

export class CreateClusterDto {
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  auxiliaryFacilitatorId?: string;

  @IsString()
  @IsNotEmpty()
  chapterId!: string;

  @IsOptional()
  @IsISO8601()
  endDate?: string;

  @Matches(TIME_FORMAT_REGEX, { message: 'endTime deve estar no formato HH:MM' })
  endTime!: string;

  @IsString()
  @IsNotEmpty()
  facilitatorId!: string;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @Matches(TIME_FORMAT_REGEX, { message: 'startTime deve estar no formato HH:MM' })
  startTime!: string;

  @IsEnum(WeekDay)
  weekDay!: WeekDay;
}
