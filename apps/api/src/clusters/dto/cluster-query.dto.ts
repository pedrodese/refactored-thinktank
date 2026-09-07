import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { WeekDay } from '../enums/week-day.enum.js';

export class ClusterQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(['active', 'inactive', 'all'])
  status?: 'active' | 'inactive' | 'all';

  @IsOptional()
  @IsEnum(WeekDay)
  weekDay?: WeekDay;

  @IsOptional()
  @IsString()
  chapterId?: string;

  @IsOptional()
  @IsString()
  facilitatorId?: string;

  @IsOptional()
  @IsString()
  auxiliaryFacilitatorId?: string;
}
